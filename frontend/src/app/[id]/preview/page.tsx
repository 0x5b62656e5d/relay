"use client";
import { useEffect, useState } from "react";

import { Button } from "@/app/components/Button";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Page() {
    const { id } = useParams();
    const [url, setUrl] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/url/link/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const fetchedData = await res.json();

            if (!res.ok && fetchedData.error) {
                setError(fetchedData.error);
                return;
            } else if (!res.ok) {
                setError("An error occurred while fetching the URL.");
                return;
            } else {
                setError(null);

                if (fetchedData.data.url.includes("://")) {
                    setUrl(fetchedData.data.url);
                } else {
                    setUrl(`https://${fetchedData.data.url}`);
                }
            }
        })();
    }, [id]);

    return (
        <div className="h-screen w-screen flex flex-col justify-center items-center">
            {url === "" ? (
                error ? (
                    <div className="w-full h-full flex flex-col justify-center items-center">
                        <div className="mt-4 text-red-500">
                            <p>Error: {error}</p>
                        </div>
                        <Button type="button" className="mt-4">
                            <Link href="/">Go home</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col justify-center items-center">
                        <h1>Loading URL...</h1>
                    </div>
                )
            ) : (
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <h1 className="text-center">
                        You will be redirected to
                        <br />
                        <Link href={url} className="underline max-w-[70%] break-words">
                            {url}
                        </Link>
                    </h1>
                    <Button type="button" className="mt-4">
                        <Link href="/">Go home</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
