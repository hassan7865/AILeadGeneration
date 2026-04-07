from pydantic import BaseModel


class AutomationConfigOut(BaseModel):
    daily_refresh: bool
    refresh_time: str
    sources: dict[str, bool]
    target_industries: list[str]
    company_size_min: int
    company_size_max: int
    geography: str
    tech_stack: list[str]
    crm_connections: dict[str, bool]


class AutomationConfigUpdate(BaseModel):
    daily_refresh: bool
    refresh_time: str
    sources: dict[str, bool]
    target_industries: list[str]
    company_size_min: int
    company_size_max: int
    geography: str
    tech_stack: list[str]
    crm_connections: dict[str, bool]
