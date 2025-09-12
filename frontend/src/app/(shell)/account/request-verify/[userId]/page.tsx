"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RequestVerify() {
    const { userId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);

        (async () => {
            if (!userId) return;

            const res = await fetch(`/api/auth/request-verify/${userId}`, {
                method: "POST",
            });

            if (res.ok) {
                setLoading(false);
            } else {
                const data = await res.json();
                setError(data.error || "An error occurred");
                setLoading(false);
            }
        })();
    }, [userId]);

    return (
        <>
            {loading ? "Loading..." : "Request complete"} {error && <span>{error}</span>}
        </>
    );
}
