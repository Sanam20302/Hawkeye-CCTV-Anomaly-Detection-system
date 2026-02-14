"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";

const API_URL = "http://localhost:8000";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const data = await res.json();
                login(data.token);
            } else {
                setError("Invalid credentials. Please try again.");
            }
        } catch (err) {
            setError("Connection failed. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="relative z-10 w-full max-w-md p-4">
                <div className="flex flex-col items-center mb-8 space-y-2">
                    <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/50 shadow-[0_0_30px_-5px_var(--color-primary)]">
                        <Video className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-wider text-white">HAWKEYE</h1>
                    <p className="text-primary font-mono tracking-widest text-sm">SECURE ACCESS REQ.</p>
                </div>

                <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>System Login</CardTitle>
                        <CardDescription>Enter your administrator credentials to proceed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Username</label>
                                <input
                                    type="text"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-zinc-700 bg-zinc-900"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                                <input
                                    type="password"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-zinc-700 bg-zinc-900"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Authenticating..." : "Access System"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-black to-black opacity-50 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
        </div>
    );
}
