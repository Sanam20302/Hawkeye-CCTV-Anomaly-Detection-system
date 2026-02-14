"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, UserPlus, ShieldAlert, ShieldCheck } from "lucide-react";
import { TrustedFace, UntrustedFace } from "@/types";

const API_URL = "http://localhost:8000";

export default function TrustedFacesPage() {
    const [trustedFaces, setTrustedFaces] = useState<TrustedFace[]>([]);
    const [untrustedFaces, setUntrustedFaces] = useState<UntrustedFace[]>([]);
    const [uploading, setUploading] = useState(false);
    const [newName, setNewName] = useState("");

    const fetchFaces = async () => {
        try {
            const trustedRes = await fetch(`${API_URL}/trusted`);
            const untrustedRes = await fetch(`${API_URL}/untrusted`);

            if (trustedRes.ok) setTrustedFaces(await trustedRes.json());
            if (untrustedRes.ok) setUntrustedFaces(await untrustedRes.json());
        } catch (e) {
            console.error("Failed to fetch faces", e);
        }
    };

    useEffect(() => {
        fetchFaces();
    }, []);

    const handleAddFace = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setUploading(true);

        try {
            const res = await fetch(`${API_URL}/trusted`, {
                method: "POST",
                body: formData,
            });
            if (res.ok) {
                setNewName("");
                // Reset form
                (e.target as HTMLFormElement).reset();
                fetchFaces();
            }
        } catch (error) {
            console.error("Upload error", error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Remove this person from trusted list?")) return;
        try {
            await fetch(`${API_URL}/trusted/${id}`, { method: "DELETE" });
            fetchFaces();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Biometric Database</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Trusted Faces Section */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center text-primary">
                            <ShieldCheck className="mr-2 h-5 w-5" /> Trusted Personnel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Upload Form */}
                        <form onSubmit={handleAddFace} className="flex gap-4 mb-6 p-4 border border-dashed border-primary/30 rounded-lg bg-primary/5">
                            <div className="flex-1">
                                <label className="block text-xs font-mono text-primary mb-1">NAME</label>
                                <input
                                    name="name"
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none"
                                    placeholder="Officer Name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-mono text-primary mb-1">PHOTO</label>
                                <input
                                    name="file"
                                    type="file"
                                    required
                                    accept="image/*"
                                    className="block w-full text-sm text-slate-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-xs file:font-semibold
                                  file:bg-primary file:text-black
                                  hover:file:bg-primary/80
                            "
                                />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" disabled={uploading} size="sm">
                                    {uploading ? "..." : <UserPlus className="h-4 w-4" />}
                                </Button>
                            </div>
                        </form>

                        {/* List */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {trustedFaces.map((face) => (
                                <div key={face.id} className="relative group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`${API_URL}/trusted_faces/${face.image_path.split(/[/\\]/).pop()}`}
                                        alt={face.name}
                                        className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 flex justify-between items-center">
                                        <span className="text-xs font-bold text-white truncate">{face.name}</span>
                                        <button onClick={() => handleDelete(face.id)} className="text-destructive hover:text-red-400">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {trustedFaces.length === 0 && (
                                <div className="col-span-full text-center text-muted-foreground text-sm py-8">
                                    No trusted personnel in database.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Untrusted / Captured Faces Section */}
                <Card className="border-destructive/20 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="flex items-center text-destructive">
                            <ShieldAlert className="mr-2 h-5 w-5" /> Recent Intruders
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {untrustedFaces.map((face) => (
                                <div key={face.id} className="relative group overflow-hidden rounded-lg border border-destructive/30 bg-black">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`${API_URL}/captured_faces/${face.image_path}`}
                                        alt="Intruder"
                                        className="w-full h-32 object-cover grayscale group-hover:grayscale-0 transition-all"
                                    />
                                    <div className="absolute top-2 right-2 bg-destructive text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                                        UNKNOWN
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2">
                                        <span className="text-[10px] font-mono text-zinc-400 block">{new Date(face.timestamp).toLocaleDateString()}</span>
                                        <span className="text-[10px] font-mono text-zinc-300 block">{new Date(face.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))}
                            {untrustedFaces.length === 0 && (
                                <div className="col-span-full text-center text-muted-foreground text-sm py-8">
                                    No unknown faces captured recently.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
