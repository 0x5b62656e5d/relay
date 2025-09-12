"use client";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
    useEffect(() => {
        (async () => {
            const res = await fetch("/api/auth/me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                redirect("/login");
            }
        })();
    }, []);

    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        </div>
    );
}
