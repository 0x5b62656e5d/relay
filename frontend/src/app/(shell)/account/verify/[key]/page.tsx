"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Verify() {
    const { key } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);

        (async () => {
            if (!key) return;

            const res = await fetch(`/api/auth/verify-account/${key}`, {
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
    }, [key]);

    return (
        <>
            {loading ? "Loading..." : "Verification complete"} {error && <span>{error}</span>}
        </>
    );
}
