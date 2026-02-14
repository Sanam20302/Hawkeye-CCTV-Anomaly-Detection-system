"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    return (
        <div className="flex">
            {!isLoginPage && <Sidebar />}
            <main className={`flex-1 min-h-screen ${!isLoginPage ? "ml-64 p-8" : "p-0"}`}>
                {children}
            </main>
        </div>
    );
}
