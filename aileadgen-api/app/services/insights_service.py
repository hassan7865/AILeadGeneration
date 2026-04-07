from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import Date, case, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Company, Lead, LeadStatus, Signal, SignalType
from app.schemas.insights import InsightsSummaryOut, LeadQualityPoint, SignalEventOut


def _pct_change(current: float, previous: float) -> float | None:
    if previous <= 0:
        return None if current <= 0 else 100.0
    return round((current - previous) / previous * 100.0, 1)


async def summary(db: AsyncSession) -> InsightsSummaryOut:
    total_leads = int((await db.scalar(select(func.count(Lead.id)))) or 0)
    qualified_count = int(
        (await db.scalar(select(func.count(Lead.id)).where(Lead.status == LeadStatus.qualified))) or 0
    )
    avg_score = float((await db.scalar(select(func.coalesce(func.avg(Lead.icp_score), 0)))) or 0)
    pipeline_value = float(qualified_count) * 10000.0

    now = datetime.now(UTC)
    this_week = now - timedelta(days=7)
    prev_week_start = now - timedelta(days=14)

    leads_this = int(
        (await db.scalar(select(func.count(Lead.id)).where(Lead.created_at >= this_week))) or 0
    )
    leads_prev = int(
        (
            await db.scalar(
                select(func.count(Lead.id)).where(Lead.created_at >= prev_week_start, Lead.created_at < this_week)
            )
        )
        or 0
    )

    qual_this = int(
        (
            await db.scalar(
                select(func.count(Lead.id)).where(
                    Lead.created_at >= this_week, Lead.status == LeadStatus.qualified
                )
            )
        )
        or 0
    )
    qual_prev = int(
        (
            await db.scalar(
                select(func.count(Lead.id)).where(
                    Lead.created_at >= prev_week_start,
                    Lead.created_at < this_week,
                    Lead.status == LeadStatus.qualified,
                )
            )
        )
        or 0
    )

    pipe_this = float(qual_this) * 10000.0
    pipe_prev = float(qual_prev) * 10000.0

    signals_7d = int(
        (await db.scalar(select(func.count(Signal.id)).where(Signal.detected_at >= this_week))) or 0
    )

    avg_rounded = round(avg_score, 2)
    avg_label = "OPTIMAL" if avg_rounded >= 70 else "BUILD"

    return InsightsSummaryOut(
        total_leads=total_leads,
        qualified_count=qualified_count,
        avg_score=avg_rounded,
        pipeline_value=pipeline_value,
        total_leads_change_pct=_pct_change(float(leads_this), float(leads_prev)),
        qualified_change_pct=_pct_change(float(qual_this), float(qual_prev)),
        pipeline_change_pct=_pct_change(pipe_this, pipe_prev),
        avg_score_label=avg_label,
        signals_last_7_days=signals_7d,
    )


async def lead_quality_series(db: AsyncSession, days: int = 30) -> list[LeadQualityPoint]:
    end = datetime.now(UTC).date()
    start = end - timedelta(days=max(days - 1, 0))
    start_dt = datetime(start.year, start.month, start.day, tzinfo=UTC)

    day_col = cast(Lead.created_at, Date)
    q = (
        select(
            day_col.label("d"),
            func.count(Lead.id).label("total"),
            func.sum(case((Lead.status == LeadStatus.qualified, 1), else_=0)).label("qualified"),
        )
        .where(Lead.created_at >= start_dt)
        .group_by(day_col)
        .order_by(day_col)
    )
    rows = (await db.execute(q)).all()
    by_day: dict[Any, tuple[int, int]] = {r.d: (int(r.total), int(r.qualified or 0)) for r in rows}

    out: list[LeadQualityPoint] = []
    cur = start
    while cur <= end:
        t, qn = by_day.get(cur, (0, 0))
        out.append(
            LeadQualityPoint(
                day=f"Day {(cur - start).days + 1:02d}",
                total=t,
                qualified=qn,
            )
        )
        cur += timedelta(days=1)

    return out


async def signal_sources_breakdown(db: AsyncSession) -> dict[str, int]:
    q = select(Signal.signal_type, func.count(Signal.id)).group_by(Signal.signal_type)
    rows = (await db.execute(q)).all()
    counts = {st.value: 0 for st in SignalType}
    total = 0
    for st, c in rows:
        counts[st.value] = int(c)
        total += int(c)
    if total == 0:
        return counts
    return {k: int(round(v / total * 100)) for k, v in counts.items()}


async def icp_segment_distribution(db: AsyncSession) -> dict[str, int]:
    industry_expr = func.coalesce(Company.industry, "Unknown")
    q = (
        select(industry_expr, func.count(Lead.id))
        .join(Company, Lead.company_id == Company.id)
        .group_by(industry_expr)
    )
    rows = (await db.execute(q)).all()
    counts = {str(name): int(c) for name, c in rows}
    total = sum(counts.values())
    if total == 0:
        return {}
    return {k: int(round(v / total * 100)) for k, v in counts.items()}


async def icp_match_average_pct(db: AsyncSession) -> int:
    avg = await db.scalar(select(func.coalesce(func.avg(Lead.icp_score), 0)))
    return int(min(100, max(0, round(float(avg or 0)))))


async def top_sources_quality(db: AsyncSession) -> list[dict[str, Any]]:
    q = (
        select(Lead.source, func.coalesce(func.avg(Lead.icp_score), 0))
        .group_by(Lead.source)
        .order_by(func.avg(Lead.icp_score).desc())
    )
    rows = (await db.execute(q)).all()
    return [{"source": r[0].value, "quality": round(float(r[1]), 1)} for r in rows]


def _heat_for_signal(st: SignalType) -> str:
    if st in (SignalType.funding_round, SignalType.hiring_surge):
        return "HOT"
    if st == SignalType.leadership_change:
        return "WARM"
    return "COLD"


def _headline(company: str, st: SignalType) -> str:
    if st == SignalType.funding_round:
        return f"Funding signal: {company}"
    if st == SignalType.hiring_surge:
        return f"Hiring surge: {company}"
    if st == SignalType.leadership_change:
        return f"Leadership change: {company}"
    return f"Expansion signal: {company}"


async def recent_signal_events(db: AsyncSession, limit: int = 20) -> list[SignalEventOut]:
    q = (
        select(Signal, Company.name)
        .join(Company, Signal.company_id == Company.id)
        .order_by(Signal.detected_at.desc())
        .limit(limit)
    )
    rows = (await db.execute(q)).all()
    out: list[SignalEventOut] = []
    for sig, company_name in rows:
        data = sig.signal_data or {}
        subtitle = data.get("summary") if isinstance(data, dict) else None
        out.append(
            SignalEventOut(
                id=sig.id,
                company_name=company_name,
                signal_type=sig.signal_type.value,
                headline=_headline(company_name, sig.signal_type),
                subtitle=subtitle,
                detected_at=sig.detected_at,
                heat=_heat_for_signal(sig.signal_type),
            )
        )
    return out
