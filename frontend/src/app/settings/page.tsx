"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Switch } from "@/components/ui/switch"; // Removed unused import
import { Settings as SettingsType } from "@/types";
import { Save } from "lucide-react";

const API_URL = "http://localhost:8000";

// Simple Slider Component since we didn't install shadcn slider
function Slider({ value, min, max, step, onChange, label }: { value: number, min: number, max: number, step: number, onChange: (val: number) => void, label: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>
                <span className="text-xs text-muted-foreground font-mono">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
        </div>
    )
}

// Simple Switch Component 
function Toggle({ checked, onCheckedChange, label }: { checked: boolean, onCheckedChange: (checked: boolean) => void, label: string }) {
    return (
        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg border-zinc-800 bg-zinc-900/50">
            <label className="text-sm font-medium leading-none">{label}</label>
            <button
                onClick={() => onCheckedChange(!checked)}
                className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-zinc-700'}`}
            >
                <span className={`content-[''] absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    )
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsType | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(err => console.error(err));
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setLoading(true);
        try {
            await fetch(`${API_URL}/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            alert("Settings saved successfully!");
        } catch (e) {
            console.error(e);
            alert("Failed to save settings.");
        } finally {
            setLoading(false);
        }
    };

    if (!settings) return <div className="p-8 text-muted-foreground">Loading configuration...</div>;

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">System Configuration</h2>
                <Button onClick={handleSave} disabled={loading}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Detection Parameters</CardTitle>
                        <CardDescription>Adjust sensitivity and thresholds for AI models.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Slider
                            label="Loitering Threshold (Seconds)"
                            value={settings.loitering_threshold}
                            min={5} max={60} step={1}
                            onChange={(v) => setSettings({ ...settings, loitering_threshold: v })}
                        />
                        <Slider
                            label="Crowd Count Threshold"
                            value={settings.crowd_threshold}
                            min={5} max={100} step={5}
                            onChange={(v) => setSettings({ ...settings, crowd_threshold: v })}
                        />

                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Modules</CardTitle>
                        <CardDescription>Enable or disable specific detection capabilities.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Toggle
                            label="Loitering Detection"
                            checked={settings.loitering_enabled}
                            onCheckedChange={(c) => setSettings({ ...settings, loitering_enabled: c })}
                        />
                        <Toggle
                            label="Crowd Monitoring"
                            checked={settings.crowd_enabled}
                            onCheckedChange={(c) => setSettings({ ...settings, crowd_enabled: c })}
                        />
                        <Toggle
                            label="Trespassing / Zone Alert"
                            checked={settings.trespassing_enabled}
                            onCheckedChange={(c) => setSettings({ ...settings, trespassing_enabled: c })}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Restricted Zone</CardTitle>
                        <CardDescription>Define the rectangular area for trespassing detection (x1, y1, x2, y2).</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs">X1</label>
                            <input
                                type="number"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm"
                                value={settings.trespassing_zone[0]}
                                onChange={(e) => {
                                    const newZone = [...settings.trespassing_zone];
                                    newZone[0] = parseInt(e.target.value) || 0;
                                    setSettings({ ...settings, trespassing_zone: newZone as [number, number, number, number] });
                                }}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs">Y1</label>
                            <input
                                type="number"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm"
                                value={settings.trespassing_zone[1]}
                                onChange={(e) => {
                                    const newZone = [...settings.trespassing_zone];
                                    newZone[1] = parseInt(e.target.value) || 0;
                                    setSettings({ ...settings, trespassing_zone: newZone as [number, number, number, number] });
                                }}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs">X2</label>
                            <input
                                type="number"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm"
                                value={settings.trespassing_zone[2]}
                                onChange={(e) => {
                                    const newZone = [...settings.trespassing_zone];
                                    newZone[2] = parseInt(e.target.value) || 0;
                                    setSettings({ ...settings, trespassing_zone: newZone as [number, number, number, number] });
                                }}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs">Y2</label>
                            <input
                                type="number"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm"
                                value={settings.trespassing_zone[3]}
                                onChange={(e) => {
                                    const newZone = [...settings.trespassing_zone];
                                    newZone[3] = parseInt(e.target.value) || 0;
                                    setSettings({ ...settings, trespassing_zone: newZone as [number, number, number, number] });
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
