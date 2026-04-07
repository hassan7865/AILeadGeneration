"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ListLoader } from "@/components/shared/list-loader";
import { useIcpHealth, useLeadQuality, useSignalSources } from "@/hooks/use-insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InsightsCharts() {
  const { data: qualityData, isLoading: loadingQuality } = useLeadQuality();
  const { data: signalSources, isLoading: loadingSources } = useSignalSources();
  const { data: icpHealth, isLoading: loadingIcp } = useIcpHealth();

  if (loadingQuality || loadingSources || loadingIcp) {
    return <ListLoader rows={6} />;
  }

  const sourcesData = Object.entries(signalSources ?? {}).map(([source, value]) => ({ source, value }));
  const segmentData = Object.entries(icpHealth ?? {}).map(([name, value]) => ({ name, value }));

  if (typeof window === "undefined") {
    return <div className="h-72 rounded-xl bg-surface-container-low" />;
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Lead Quality Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={qualityData ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#004ac6" strokeWidth={2} />
              <Line type="monotone" dataKey="qualified" stroke="#b4c5ff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Signal Sources</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourcesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ICP Segment Health</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segmentData} dataKey="value" nameKey="name" outerRadius={80} fill="#004ac6" label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
