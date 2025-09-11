"use client";
import { shortenUrl } from "@/app/backend/url";
import { RiClipboardLine } from "@remixicon/react";
import { useState } from "react";

export default function Home() {
    const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleShorten = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const shortenedRes = await shortenUrl((event.target as HTMLFormElement).url.value);

        if (shortenedRes.error) {
            setError(shortenedRes.error);
        } else {
            setShortenedUrl(`https://relay.pepper.fyi/${shortenedRes.urlId}`);
            setError(null);
            setCopied(false);
        }
    };

    const copyToClipboard = () => {
        if (!shortenedUrl) {
            return;
        }

        navigator.clipboard.writeText(shortenedUrl);
        setCopied(true);
    };

    return (
        <>
            <h1 className="text-4xl font-bold">Relay</h1>
            <p className="mt-4 text-lg">A URL shortener built with NextJS and Rust</p>
            <p className="mt-2 text-m">All URL&apos;s expire in 14 days!</p>

            <div className="mt-6">
                <form
                    onSubmit={handleShorten}
                    method="POST"
                    className="flex flex-col justify-center items-center gap-[6px] w-70"
                >
                    <div className="relative flex flex-col justify-center items-center text-center my-[10px] w-full">
                        <label htmlFor="url">Enter URL:</label>
                        <input
                            type="url"
                            id="url"
                            className="url-input mt-[6px] text-center py-2"
                            placeholder="https://example.com"
                            minLength={1}
                            required
                            aria-required="true"
                        />
                        <span className="input-border" />
                    </div>
                    <button
                        type="submit"
                        className="bg-[var(--button-bg)] text-[var(--button-fg)] px-4 py-2 rounded"
                    >
                        Shorten URL
                    </button>
                </form>
            </div>

            <div
                className={`flex flex-col justify-center items-center relative fade-in ${
                    shortenedUrl ? "opacity-100" : "opacity-0"
                }`}
            >
                <div className="mt-4 flex justify-center items-center gap-[18px]">
                    <p>{shortenedUrl}</p>
                    <button onClick={copyToClipboard}>
                        <RiClipboardLine />
                    </button>
                </div>
                <p
                    className={`text-[var(--copied)] mt-2 absolute bottom-[-2rem] fade-in ${
                        copied ? "opacity-100" : "opacity-0"
                    }`}
                >
                    Copied to clipboard!
                </p>
            </div>

            {error && (
                <div className="mt-4 text-red-500">
                    <p>Error: {error}</p>
                </div>
            )}
        </>
    );
}
