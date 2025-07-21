"use client";
import { shortenUrl } from "@/util/api";
import { useState } from "react";

export default function Home() {
    const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const handleShorten = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const shortenedRes = await shortenUrl((event.target as HTMLFormElement).url.value);

        if (shortenedRes.error) {
            setError(shortenedRes.error);
        } else {
            setShortenedUrl(`https://relay.pepper.fyi/${shortenedRes.urlId}`);
        }
    };

    return (
        <>
            <h1 className="text-4xl font-bold">Welcome to Relay</h1>
            <p className="mt-4 text-lg">A URL shortener built with NextJS and Rust</p>

            <div>
                <form onSubmit={handleShorten} method="POST">
                    <label htmlFor="url">Enter URL:</label>
                    <input type="url" id="url" minLength={1} required aria-required="true" />
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

            {error && (
                <div className="mt-4 text-red-500">
                    <p>Error: {error}</p>
                </div>
            )}
        </>
    );
}
