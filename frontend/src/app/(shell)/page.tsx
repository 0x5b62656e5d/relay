"use client";
import { useEffect, useState } from "react";

import { Button } from "@/app/components/Button";
import { StatusMessage } from "@/util/types";
import { RiClipboardLine, RiDownloadLine, RiQrCodeLine, RiSendPlaneLine } from "@remixicon/react";
import { QRCodeCanvas } from "qrcode.react";

export default function Home() {
    const [computedStyle, setComputedStyle] = useState<CSSStyleDeclaration | null>(null);
    const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [showQr, setShowQr] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<StatusMessage>({
        success: null,
        message: null,
    });

    useEffect(() => {
        setComputedStyle(window.getComputedStyle(document.documentElement));
    }, []);

    const handleShorten = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const urlRegex =
            /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;

        if (!(event.target as HTMLFormElement).url.value.match(urlRegex)) {
            setStatusMessage({ success: false, message: "Please enter a valid URL." });
            return;
        }

        setStatusMessage({ success: null, message: null });
        const res = await fetch("/api/url/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: (event.target as HTMLFormElement).url.value,
            }),
        });

        const shortenedRes = await res.json();

        if (shortenedRes.error) {
            setStatusMessage({ success: false, message: shortenedRes.error });
        } else {
            setShortenedUrl(`https://relay.pepper.fyi/${shortenedRes.data.urlId}`);
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

    const showQrCode = () => {
        setShowQr(true);
    };

    const downloadQrCode = () => {
        const canvas = document.querySelector("canvas");

        if (!canvas) {
            return;
        }

        const imgUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = imgUrl;
        downloadLink.download = `Relay QR Code - ${shortenedUrl}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className="h-full flex flex-col justify-center items-center load-in">
            <h1 className="text-8xl font-extrabold tracking-tight">Relay</h1>
            <p className="mt-4 text-xl opacity-75">A URL shortener built with NextJS and Rust</p>
            <div className="mt-6 flex flex-col justify-center items-center">
                <form
                    onSubmit={handleShorten}
                    method="POST"
                    className="flex justify-center items-center gap-[6px] w-70"
                >
                    <div className="relative flex flex-col justify-center items-center text-center w-full">
                        <input
                            type="text"
                            id="url"
                            className="text-center border"
                            placeholder="Enter a URL..."
                            minLength={1}
                            required
                            aria-required="true"
                        />
                    </div>
                    <Button type="submit" className="h-10 w-10 flex justify-center items-center p-2! rounded-xl">
                        <RiSendPlaneLine />
                    </Button>
                </form>
                <p className="mt-4 text-xs opacity-75">All URLs expire 30 days after their last click!</p>
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
                    <button onClick={showQrCode}>
                        <RiQrCodeLine />
                    </button>
                </div>
                <p
                    className={`text-[var(--copied)] mt-2 absolute bottom-[-2rem] fade-in ${
                        copied ? "opacity-100 block" : "opacity-0 hidden"
                    } `}
                >
                    Copied to clipboard!
                </p>
                <div
                    className={`mt-2 fade-in flex flex-col justify-center items-center ${showQr ? "opacity-100 block" : "opacity-0 hidden"}`}
                >
                    <QRCodeCanvas
                        value={shortenedUrl ?? ""}
                        bgColor={computedStyle?.getPropertyValue("--background").trim()}
                        fgColor={computedStyle?.getPropertyValue("--foreground").trim()}
                        marginSize={2}
                        size={512}
                        className="w-42! h-42!"
                    />
                    <Button type="button" className="mt-2" onClick={downloadQrCode}>
                        <RiDownloadLine />
                    </Button>
                </div>
            </div>

            <p
                className={`text-center mt-4 text-red-500
                    fade-in ${statusMessage.message ? "opacity-100 block" : "opacity-0 hidden"}`}
            >
                {statusMessage.message}
            </p>
        </div>
    );
}
