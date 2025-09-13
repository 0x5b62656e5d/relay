"use client";
import { useState, useEffect } from "react";

import { UrlClick, UrlData } from "@/util/types";
import { useParams } from "next/navigation";
import { formatDate } from "@/util/date";
import { Button } from "@/app/components/Button";
import { DashboardInfoCard } from "@/app/components/DashboardInfoCard";
import { RiClipboardLine } from "@remixicon/react";
import ClicksLineChart from "@/app/components/UrlClickChart";

export default function Page() {
    const { id } = useParams();
    const [computedStyle, setComputedStyle] = useState<CSSStyleDeclaration | null>(null);
    const [url, setUrl] = useState<{ url_data: UrlData | null; url_clicks: UrlClick[] | null }>({
        url_data: null,
        url_clicks: null,
    });
    const [comment, setComment] = useState("");

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

    return (
        <div className="w-full h-full flex justify-center items-center">
            {url ? (
                <div className="h-[90%] w-[95%] grid grid-rows-[1fr_4fr_2fr] gap-4">
                    <div className="w-full h-full flex flex-row justify-evenly items-center">
                        <DashboardInfoCard title="URL ID">
                            <div className="flex justify-center items-center gap-1">
                                <p>{url.url_data?.id} </p>
                                <button onClick={copyToClipboard}>
                                    <RiClipboardLine />
                                </button>
                            </div>
                        </DashboardInfoCard>
                        <DashboardInfoCard title="Original URL">
                            <p>{url.url_data?.url}</p>
                        </DashboardInfoCard>
                        <DashboardInfoCard title="Total clicks">
                            <p>{url.url_data?.clicks}</p>
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
                    </div>
                    {/* <div className="w-full h-full grid grid-cols-[3fr_1fr] p-5 gap-4"> */}
                    <div className="h-full p-5">
                        <div className="h-full w-auto flex justify-center items-center">
                            <ClicksLineChart clicks={url.url_clicks ? url.url_clicks : []} foreground={computedStyle?.getPropertyValue("--foreground").trim() as string} />
                        </div>
                        {/* <div className="w-full h-full bg-pink-800"></div> */}
                    </div>
                    <div className="w-full h-full grid grid-cols-[3fr_1fr] p-5 gap-4">
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
        </div>
    );
}
