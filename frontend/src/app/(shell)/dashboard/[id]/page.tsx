"use client";
import { useState, useEffect } from "react";

import { Url } from "@/util/types";
import { useParams } from "next/navigation";

export default function Page() {
    const { id } = useParams();
    const [url, setUrl] = useState<Url | null>(null);

    useEffect(() => {
        const fetchUrl = async () => {
            const res = await fetch(`/api/urls/${id}`);
            const json = await res.json();
            setUrl(json.data);
        };
        fetchUrl();
    }, [id]);

    return (
        <div className="w-full h-full flex justify-center items-center">
            {url ? (
                <div>
                    <h1>{url.id}</h1>
                    <p>{url.url}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
