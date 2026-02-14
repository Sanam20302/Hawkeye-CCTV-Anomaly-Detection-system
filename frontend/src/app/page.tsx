"use client";

import { useEffect, useState } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { StatsCard } from "@/components/StatsCard";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { useInterval } from "@/hooks/use-interval";
import { AlertTriangle, Users, Activity, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, APIResponse } from "@/types";

const POLLING_RATE = 1000; // 1s
const API_URL = "http://localhost:8000";

interface DashboardState {
  occupancy: number;
  peakOccupancy: number;
  totalAlerts: number;
  alerts: { type: string; message: string; time: string }[];
}

export default function Dashboard() {
  const [sourceType, setSourceType] = useState<"webcam" | "upload">("webcam");
  // Mock initial state
  const [stats, setStats] = useState<DashboardState>({
    occupancy: 0,
    peakOccupancy: 0,
    totalAlerts: 0,
    alerts: [],
  });

  const [occupancyHistory, setOccupancyHistory] = useState<{ time: string; count: number }[]>([]);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  useInterval(() => {
    fetch(`${API_URL}/stats?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("[DEBUG] Stats fetched successfully:", data);
        setStats(prev => ({
          ...prev,
          occupancy: data.occupancy,
          peakOccupancy: data.peak_occupancy,
          totalAlerts: data.total_alerts,
          alerts: data.alerts || []
        }));

        setOccupancyHistory(prev => {
          const newHistory = [...prev, { time: new Date().toLocaleTimeString(), count: data.occupancy }];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });
      })
      .catch(err => console.error("[ERROR] Failed to fetch stats:", err));
  }, POLLING_RATE);

  const handleSourceChange = async (type: "webcam" | "upload") => {
    // Optimistic UI update
    setSourceType(type);

    const formData = new FormData();
    formData.append("source_type", type);
    try {
      const res = await fetch(`${API_URL}/set_source`, {
        method: "POST",
        body: formData
      });
      if (res.ok) console.log(`[DEBUG] Source changed to ${type} successfully`);
      else console.error(`[ERROR] Failed to change source to ${type}`);
    } catch (e) {
      console.error("Failed to switch source", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    // Switch to upload mode and optimistic update
    setSourceType("upload");

    try {
      const res = await fetch(`${API_URL}/upload_video`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        console.log("[DEBUG] Video uploaded successfully");
      } else {
        const errorData = await res.json();
        console.error("[ERROR] Upload failed:", errorData.message || res.statusText);
      }
    } catch (e) {
      console.error("Upload failed", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Smart CCTV Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => handleSourceChange("webcam")} size="sm" variant={sourceType === "webcam" ? "default" : "outline"}>
            <Video className="mr-2 h-4 w-4" /> Webcam
          </Button>
          <Button onClick={() => document.getElementById('file-upload')?.click()} size="sm" variant={sourceType === "upload" ? "default" : "outline"}>
            <Upload className="mr-2 h-4 w-4" /> Upload Video
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="video/*"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Current People Count"
          value={stats.occupancy}
          icon={Users}
          description="People currently in frame"
          trend={stats.occupancy > 2 ? "up" : "neutral"}
          trendValue={stats.occupancy > 2 ? "+2" : ""}
        />
        <StatsCard
          title="Total Alerts"
          value={stats.totalAlerts}
          icon={AlertTriangle}
          description="Session anomalies"
          alert={stats.totalAlerts > 0}
          trend="up"
          trendValue={stats.totalAlerts > 0 ? "NEW" : ""}
        />
        <StatsCard
          title="Peak Crowd"
          value={stats.peakOccupancy}
          icon={Activity}
          description="Highest concurrent count"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-zinc-950/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Live Feed</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <VideoPlayer key={sourceType} streamUrl={`${API_URL}/video_feed`} isLive={sourceType === "webcam"} />
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-4">
          {/* Trend Chart */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>People Count Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <AnalyticsChart data={occupancyHistory} />
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts Card */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-zinc-800 bg-zinc-950/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Alerts</span>
                <div className="flex gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                </div>
              </CardTitle>
              <CardDescription>Latest anomalies detected by the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {stats.alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 transition-colors">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-zinc-200">{alert.message}</p>
                      <p className="text-xs text-zinc-500 font-mono">{alert.time}</p>
                    </div>
                  </div>
                ))}
                {stats.alerts.length === 0 && (
                  <div className="text-center py-8 text-zinc-500 text-sm italic">No recent alerts detected. Safe system state.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
