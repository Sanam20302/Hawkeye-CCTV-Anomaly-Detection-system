"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DataPoint {
    time: string;
    count: number;
}

interface AnalyticsChartProps {
    data: DataPoint[];
    title?: string;
}

export function AnalyticsChart({ data, title = "Live Occupancy Trend" }: AnalyticsChartProps) {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pb-2">
                <CardTitle className="text-base font-normal text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="time"
                                stroke="#52525b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#52525b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                itemStyle={{ color: "#ededed" }}
                                labelStyle={{ color: "#a1a1aa" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#22c55e"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
