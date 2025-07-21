"use client";
import { shortenUrl } from "@/util/api";
import { useState } from "react";

export default function Home() {
    const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
    
    const handleShorten = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const url = (event.target as HTMLFormElement).url.value;
        const id = await shortenUrl(url);
        setShortenedUrl(`https://relay.pepper.fyi/${id}`);
    };

    return (
        <>
            <h1 className="text-4xl font-bold">Welcome to Relay</h1>
            <p className="mt-4 text-lg">A URL shortener built with NextJS and Rust</p>

            <div>
                <form onSubmit={handleShorten} method="POST">
                    <label htmlFor="url">Enter URL:</label>
                    <input type="text" id="url" />
                    <button type="submit" className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
                        Shorten URL
                    </button>
                </form>
            </div>

            {shortenedUrl && (
                <div className="mt-4">
                    <p>Shortened URL: {shortenedUrl}</p>
                </div>
            )}
        </>
    );
}
