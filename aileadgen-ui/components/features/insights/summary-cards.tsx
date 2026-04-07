"use client";

import { ListLoader } from "@/components/shared/list-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInsightsSummary } from "@/hooks/use-insights";

export function SummaryCards() {
  const { data, isLoading } = useInsightsSummary();

  if (isLoading) {
    return <ListLoader rows={4} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Leads</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-extrabold">{data?.total_leads ?? "-"}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Qualified</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-extrabold">{data?.qualified_count ?? "-"}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Avg ICP Score</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-extrabold">{data?.avg_score ?? "-"}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Value</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-extrabold">${data?.pipeline_value?.toLocaleString() ?? "-"}</CardContent>
      </Card>
    </div>
  );
}
