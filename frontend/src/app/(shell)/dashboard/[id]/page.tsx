"use client";
import { useEffect, useState } from "react";

import { Button } from "@/app/components/Button";
import { DashboardInfoCard } from "@/app/components/DashboardInfoCard";
import ClicksLineChart from "@/app/components/UrlClickChart";
import { formatDate } from "@/util/date";
import { UrlClick, UrlData } from "@/util/types";
import { RiClipboardLine, RiCloseLine, RiDownloadLine, RiQrCodeLine } from "@remixicon/react";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { createPortal } from "react-dom";

export default function Page() {
    const { id } = useParams();
    const [computedStyle, setComputedStyle] = useState<CSSStyleDeclaration | null>(null);
    const [url, setUrl] = useState<{ url_data: UrlData | null; url_clicks: UrlClick[] | null }>({
        url_data: null,
        url_clicks: null,
    });
    const [comment, setComment] = useState("");
    const [showQrModal, setShowQrModal] = useState<boolean>(false);

    useEffect(() => {
        setComputedStyle(window.getComputedStyle(document.documentElement));
    }, []);

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/url/data/${id}`);

            if (res.ok) {
                const json = await res.json();

                setUrl({ url_data: json.data.url_data, url_clicks: json.data.clicks });
                setComment(json.data.url_data?.comments || "");
            }
        })();
    }, [id]);

    const copyToClipboard = () => {
        if (!url.url_data) {
            return;
        }

        navigator.clipboard.writeText(`https://relay.pepper.fyi/${url.url_data.id}`);
    };

    const saveComment = async () => {
        if (!url.url_data) {
            return;
        }

        const res = await fetch(`/api/url/comment/${url.url_data.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ comment }),
        });

        if (res.ok) {
            setUrl(prev => ({
                ...prev,
                url_data: {
                    ...prev.url_data!,
                    comments: comment,
                },
            }));
        }
    };

    const deleteUrl = async (id: string) => {
        if (!id) {
            return;
        }

        if (!confirm("Are you sure you want to delete this URL? This action cannot be undone.")) {
            return;
        }

        const res = await fetch(`/api/url/delete/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            window.location.href = "/dashboard";
        }
    };

    useEffect(() => {
        if (!showQrModal) {
            return;
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowQrModal(false);
            }
        };

        window.addEventListener("keydown", onKey);

        return () => window.removeEventListener("keydown", onKey);
    }, [showQrModal]);

    const downloadQrCode = () => {
        const canvas = document.querySelector("canvas");

        if (!canvas) {
            return;
        }

        const imgUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = imgUrl;
        downloadLink.download = `Relay QR Code - relay.pepper.fyi/${url.url_data?.id}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className="w-full xl:h-full flex justify-center items-center">
            {url ? (
                <div className="h-[90%] w-[95%] grid xl:grid-rows-[1fr_4fr_2fr] grid-rows-[1fr_2fr_1fr] gap-4">
                    <div className="w-full h-full xl:flex xl:flex-row xl:gap-0 grid grid-rows-[1fr_1fr_1fr] grid-cols-[1fr_1fr] justify-evenly items-center gap-2">
                        <DashboardInfoCard title="URL ID">
                            <div className="flex justify-center items-center gap-1">
                                <p>{url.url_data?.id} </p>
                                <button onClick={copyToClipboard}>
                                    <RiClipboardLine />
                                </button>
                                <button onClick={() => setShowQrModal(true)}>
                                    <RiQrCodeLine />
                                </button>
                            </div>
                        </DashboardInfoCard>
                        <DashboardInfoCard title="Original URL">
                            <p>{url.url_data?.url}</p>
                        </DashboardInfoCard>
                        <DashboardInfoCard title="Created at">
                            <p>
                                {url.url_data?.created_at
                                    ? formatDate(url.url_data?.created_at)
                                    : "Never"}
                            </p>
                        </DashboardInfoCard>
                        <DashboardInfoCard title="Last clicked">
                            <p>
                                {url.url_data?.last_clicked
                                    ? formatDate(url.url_data?.last_clicked)
                                    : "Never"}
                            </p>
                        </DashboardInfoCard>
                        <DashboardInfoCard title="Total clicks" className="col-span-2">
                            <p>{url.url_data?.clicks}</p>
                        </DashboardInfoCard>
                    </div>
                    <div className="h-full p-5">
                        <div className="h-full w-auto flex justify-center items-center">
                            <ClicksLineChart
                                clicks={url.url_clicks ? url.url_clicks : []}
                                foreground={
                                    computedStyle?.getPropertyValue("--foreground").trim() as string
                                }
                            />
                        </div>
                    </div>
                    <div className="w-full h-full grid xl:grid-cols-[3fr_1fr] grid-rows-[1fr_1fr] p-5 gap-4">
                        <div className="w-full h-full flex flex-col gap-2">
                            <label htmlFor="comments">Comments</label>
                            <textarea
                                className={`rounded h-full border-2 border-[${computedStyle?.getPropertyValue("--foreground").trim()}]`}
                                name="comments"
                                id="comments"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                            />
                        </div>
                        <div className="w-full h-full flex flex-col justify-center items-center gap-6">
                            <Button type="button" className="w-[80%]" onClick={saveComment}>
                                Save comment
                            </Button>
                            <Button
                                type="button"
                                className="w-[80%]"
                                onClick={() => deleteUrl(url.url_data!.id)}
                            >
                                Delete URL
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
            {computedStyle &&
                createPortal(
                    <div className={`modal ${showQrModal ? "modal-show" : ""} fade-in`}>
                        <div
                            className="modal-bg"
                            onClick={e => {
                                console.log(e.target, e.currentTarget);
                                if (e.target === e.currentTarget) {
                                    setShowQrModal(false);
                                }
                            }}
                        />
                        <div className="relative flex flex-col justify-center items-center p-12 rounded border border-white bg-[var(--background)] z-200">
                            <QRCodeCanvas
                                value={`https://relay.pepper.fyi/${url.url_data?.id}`}
                                bgColor={`${computedStyle?.getPropertyValue("--background").trim()}00`}
                                fgColor={computedStyle?.getPropertyValue("--foreground").trim()}
                                marginSize={2}
                                size={512}
                                className="w-42! h-42! z-300"
                            />
                            <Button type="button" className="mt-2" onClick={downloadQrCode}>
                                <RiDownloadLine />
                            </Button>
                            <button
                                className="absolute top-0 left-0 m-4 z-110"
                                onClick={() => setShowQrModal(false)}
                            >
                                <RiCloseLine />
                            </button>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
