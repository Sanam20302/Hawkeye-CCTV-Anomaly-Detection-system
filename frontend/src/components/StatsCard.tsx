import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    alert?: boolean;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    trendValue,
    alert
}: StatsCardProps) {
    return (
        <Card className={`border-l-4 ${alert ? "border-l-destructive bg-destructive/10" : "border-l-primary"}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${alert ? "text-destructive" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold font-mono ${alert ? "text-destructive" : ""}`}>{value}</div>
                {(description || trendValue) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trendValue && (
                            <span className={trend === "up" ? "text-destructive" : "text-primary"}>
                                {trend === "up" ? "↑" : "↓"} {trendValue}{" "}
                            </span>
                        )}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
