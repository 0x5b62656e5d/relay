"use client";
import { redirect, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
    const { id } = useParams();
    const [url, setUrl] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/url/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                setError("An error occurred while fetching the URL.");
                return;
            }

            const fetchedData = await res.json();

            if (fetchedData.error) {
                setError(fetchedData.error);
                return;
            } else {
                setUrl(fetchedData.data.url);
                setError(null);
            }
        })();
    }, [id]);

    if (url !== "") {
        redirect(url);
    }

    return (
        <>
            <h1>Redirecting...</h1>
            {error && (
                <>
                    <div className="mt-4 text-red-500">
                        <p>Error: {error}</p>
                    </div>
                    <button className="mt-4 bg-[var(--button-bg)] text-[var(--button-fg)] px-4 py-2 rounded">
                        <Link href="/">Go home</Link>
                    </button>
                </>
            )}
        </>
    );
}
