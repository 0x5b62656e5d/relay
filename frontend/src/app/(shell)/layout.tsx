"use client";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/app/components/Button";
import { StateContext } from "@/app/context/StateContext";
import {
    RiBarChartFill,
    RiGithubFill,
    RiHome2Line,
    RiLoginBoxLine,
    RiLogoutBoxLine,
    RiSettings2Line,
    RiUserLine,
} from "@remixicon/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import "@/app/(shell)/hamburger.css";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [userState, setUserState] = useState<{ name: string | null; loggedIn: boolean }>({
        name: null,
        loggedIn: false,
    });
    const [smallScreen, setSmallScreen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const linkRef = useRef<HTMLAnchorElement>(null);

    const checkScreenWidth = () => {
        if (window.innerWidth < 1280) {
            setSmallScreen(true);
            window.addEventListener("click", handleMenuClicks);
        } else {
            setSmallScreen(false);
        }
    };

    const handleMenuClicks = (e: MouseEvent) => {
        if (!(e.target as HTMLElement).classList.contains("hamburger-span")) {
            setMenuOpen(false);
        }
    };

    const handleDesktopMenuClicks = (e: MouseEvent) => {
        const target = e.target as Node;

        if (
            menuRef.current &&
            buttonRef.current &&
            linkRef.current &&
            !menuRef.current.contains(target) &&
            !buttonRef.current.contains(target) &&
            !linkRef.current.contains(target)
        ) {
            setMenuOpen(false);
        }
    };

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/auth/me");

            if (res.ok) {
                const data = await res.json();
                setUserState({ name: data.data.name, loggedIn: true });
            } else {
                setUserState({ name: null, loggedIn: false });
            }
        })();

        checkScreenWidth();
        window.addEventListener("resize", checkScreenWidth);
        window.addEventListener("mousedown", handleDesktopMenuClicks);

        return () => {
            window.removeEventListener("resize", checkScreenWidth);
            window.removeEventListener("click", handleMenuClicks);
            window.removeEventListener("mousedown", handleDesktopMenuClicks);
        };
    }, []);

    const logoutClickHandler = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setMenuOpen(false);

        await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        setUserState({ name: null, loggedIn: false });
        redirect("/login");
    };

    return (
        <>
            <header className="w-full xl:flex xl:justify-center xl:items-center gap-[20px] mt-6 mb-6">
                {!smallScreen ? (
                    <>
                        <div className="absolute left-6">
                            {userState.loggedIn && (
                                <Button type="button" className="flex justify-center items-center">
                                    <Link
                                        href="/dashboard"
                                        className="flex justify-center items-center gap-2 relative z-10"
                                    >
                                        <RiBarChartFill /> Dashboard
                                    </Link>
                                </Button>
                            )}
                        </div>
                        <h1 className="text-4xl font-bold">
                            <Link href="/" className="relative">
                                Relay
                            </Link>
                        </h1>
                        <div className="fixed right-6 z-500">
                            <div
                                ref={menuRef}
                                className={`absolute z-700 right-0 mt-16 w-48 border rounded shadow-xl flex flex-col bg-[var(--background)] ${menuOpen ? "translate-x-0" : "translate-x-[250px]"} transition duration-300 ease-in-out ${userState.loggedIn ? "block" : "hidden"}`}
                            >
                                <Link
                                    ref={linkRef}
                                    href="/account/manage"
                                    className="px-4 py-2 flex items-center"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <RiSettings2Line className="inline mr-2" /> Manage account
                                </Link>
                                <button
                                    ref={buttonRef}
                                    onClick={logoutClickHandler}
                                    className="px-4 py-2 flex items-center"
                                >
                                    <RiLogoutBoxLine className="mr-2" /> Log out
                                </button>
                            </div>
                            {userState.loggedIn ? (
                                <Button
                                    type="button"
                                    className="flex justify-center items-center"
                                    onClick={() => setMenuOpen(!menuOpen)}
                                >
                                    <RiUserLine /> Account
                                </Button>
                            ) : (
                                <Button type="button" className="flex justify-center items-center">
                                    <Link
                                        href="/login"
                                        className="flex justify-center items-center gap-2 relative"
                                    >
                                        <RiLoginBoxLine /> Log in
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="relative ml-6">
                            <div
                                className={`hamburger ${menuOpen ? "open" : ""}`}
                                onMouseDown={() => setMenuOpen(!menuOpen)}
                            >
                                <span className="hamburger-span"></span>
                                <span className="hamburger-span"></span>
                                <span className="hamburger-span"></span>
                                <span className="hamburger-span"></span>
                                <span className="hamburger-span"></span>
                                <span className="hamburger-span"></span>
                            </div>
                            <div
                                className={`absolute z-500 left-0 mt-4 w-48 border rounded shadow-xl flex flex-col bg-[var(--background)] ${menuOpen ? "translate-x-0" : "translate-x-[-250px]"} transition duration-300 ease-in-out`}
                            >
                                <Link
                                    href="/"
                                    className="px-4 py-2 hover:bg-gray-100"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <RiHome2Line className="inline mr-2" /> Home
                                </Link>
                                {userState.loggedIn && (
                                    <Link
                                        href="/dashboard"
                                        className="px-4 py-2 hover:bg-gray-100"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <RiBarChartFill className="inline mr-2" /> Dashboard
                                    </Link>
                                )}
                                {userState.loggedIn ? (
                                    <>
                                        <Link
                                            href="/account/manage"
                                            className="px-4 py-2 hover:bg-gray-100"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <RiUserLine className="inline mr-2" /> Manage account
                                        </Link>
                                        <button
                                            onClick={logoutClickHandler}
                                            className="px-4 py-2 flex items-center hover:bg-gray-100"
                                        >
                                            <RiLogoutBoxLine className="mr-2" /> Log out
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 hover:bg-gray-100"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <RiLoginBoxLine className="inline mr-2" /> Log in
                                    </Link>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </header>
            <div className="min-h-0 flex flex-1 justify-center items-center w-full load-in">
                <StateContext.Provider
                    value={{ userState, setUserState, smallScreen, setSmallScreen }}
                >
                    {children}
                </StateContext.Provider>
            </div>
            <footer className="w-full flex flex-col justify-center items-center relative mb-6">
                <div className="flex justify-center items-center gap-[20px]">
                    <p className="text-sm w-fit">Made with a pinch of Pepper</p>
                    <a href="https://github.com/0x5b62656e5d/relay" target="_blank">
                        <RiGithubFill />
                    </a>
                </div>
            </footer>
        </>
    );
}
