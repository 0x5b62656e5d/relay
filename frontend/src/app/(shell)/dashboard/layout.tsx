"use client";
import { useEffect, useState } from "react";

import { UrlData } from "@/util/types";
import Link from "next/link";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [url, setUrl] = useState<Array<UrlData>>([]);
    const [urlFilter, setUrlFilter] = useState<string>("");

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/url/list");

            const json = await res.json();
            setUrl(json.data);
        })();
    }, []);

    return (
        <div className="w-full h-full grid grid-cols-[1fr_5fr] justify-center items-center load-in">
            <div className="h-full flex flex-col justify-start p-10 gap-10">
                <div className="relative flex flex-col justify-center items-center">
                    <label className="w-full" htmlFor="url-filter">
                        Filter
                    </label>
                    <input
                        type="text"
                        name="url-filter"
                        value={urlFilter}
                        onChange={e => setUrlFilter(e.target.value)}
                        required
                        aria-required="true"
                    />
                    <span className="input-border" />
                </div>
                <div className="h-[70vh] flex flex-col gap-6 items-baseline overflow-y-auto scrollbar p-2">
                    {url &&
                        url.map(u => {
                            if (u.url.includes(urlFilter) || u.id.includes(urlFilter)) {
                                return (
                                    <Link key={u.id} href={`/dashboard/${u.id}`}>
                                        <p>{u.id}</p>
                                        <p>{u.url}</p>
                                    </Link>
                                );
                            }
                        })}
                </div>
            </div>
            {children}
        </div>
    );
}
