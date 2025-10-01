"use client";
import { useContext, useEffect, useState } from "react";

import { StateContext } from "@/app/context/StateContext";
import { UrlData } from "@/util/types";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "@remixicon/react";
import Link from "next/link";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [url, setUrl] = useState<Array<UrlData>>([]);
    const [urlFilter, setUrlFilter] = useState<string>("");
    const { smallScreen } = useContext(StateContext);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/url/list");

            const json = await res.json();
            setUrl(json.data);
        })();
    }, []);

    return !smallScreen ? (
        <div className="w-full h-full grid grid-cols-[1fr_5fr] justify-center items-center load-in">
            <div className="h-full flex flex-col justify-start p-10 gap-10">
                {/* <div className="relative flex flex-col justify-center items-center"> */}
                <input
                    type="text"
                    name="url-filter"
                    value={urlFilter}
                    placeholder="Filter URLs"
                    onChange={e => setUrlFilter(e.target.value)}
                    required
                    aria-required="true"
                />
                {/* </div> */}
                <div className="h-[70vh] flex flex-col gap-6 items-baseline overflow-y-auto p-2">
                    {url &&
                        url.map(u => {
                            if (u.url.includes(urlFilter) || u.id.includes(urlFilter)) {
                                return (
                                    <Link key={u.id} href={`/dashboard/${u.id}`}>
                                        <p>{u.id}</p>
                                        <p>
                                            {u.url.length > 20
                                                ? u.url.substring(0, 18) + "..."
                                                : u.url}
                                        </p>
                                    </Link>
                                );
                            }
                        })}
                </div>
            </div>
            {children}
        </div>
    ) : (
        <div className="w-full h-full flex flex-col justify-center items-center load-in">
            <div
                className={`url-list-menu absolute left-0 top-[80] h-[80%] flex flex-col justify-start p-6 gap-10 z-300 bg-[var(--background)] border rounded ${menuOpen ? "translate-x-0" : "translate-x-[-250px]"} transition duration-300 ease-in-out`}
            >
                {menuOpen ? (
                    <RiArrowDropLeftLine
                        size={64}
                        className="absolute right-[-70]"
                        onClick={() => setMenuOpen(false)}
                    />
                ) : (
                    <RiArrowDropRightLine
                        size={64}
                        className="absolute right-[-70]"
                        onClick={() => setMenuOpen(true)}
                    />
                )}

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
                <div className="h-[70vh] flex flex-col gap-6 items-baseline overflow-y-auto p-2">
                    {url &&
                        url.map(u => {
                            if (u.url.includes(urlFilter) || u.id.includes(urlFilter)) {
                                return (
                                    <Link
                                        key={u.id}
                                        href={`/dashboard/${u.id}`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <p>{u.id}</p>
                                        <p>
                                            {u.url.length > 20
                                                ? u.url.substring(0, 18) + "..."
                                                : u.url}
                                        </p>
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
