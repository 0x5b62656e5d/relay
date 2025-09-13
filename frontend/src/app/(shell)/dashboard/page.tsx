"use client";
import { useEffect, useState } from "react";

import { redirect } from "next/navigation";

export default function Dashboard() {
    const [name, setName] = useState<string | null>(null);
    const [urlCount, setUrlCount] = useState<number | null>(null);

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

            const nameData = await res.json();
            setName(nameData.data.name);

            const res2 = await fetch("/api/url/count", {
                method: "GET",
            });

            if (res2.ok) {
                const countData = await res2.json();
                setUrlCount(countData.data);
            }
        })();
    }, []);

    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <h1 className="text-4xl font-bold mb-4">Hello {name}!</h1>
            <p className="text-xl font-semibold mb-4">You currently have {urlCount ?? "0"} URLs.</p>
        </div>
    );
}
