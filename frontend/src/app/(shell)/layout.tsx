"use client";
import { useEffect, useState } from "react";

import { Button } from "@/app/components/Button";
import { UserContext } from "@/app/context/UserContext";
import { RiLogoutBoxLine, RiLoginBoxLine, RiGithubFill, RiBarChartFill } from "@remixicon/react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [userState, setUserState] = useState<{ name: string | null; loggedIn: boolean }>({
        name: null,
        loggedIn: false,
    });
    const [brokenStyling, setBrokenStyling] = useState(false);

    const checkScreenWidth = () => {
        if (window.innerWidth < 1024) {
            setBrokenStyling(true);
        } else {
            setBrokenStyling(false);
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

        return () => {
            window.removeEventListener("resize", checkScreenWidth);
        };
    }, []);

    const logoutClickHandler = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

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
            <header className="w-full flex justify-center items-center gap-[20px] relative mt-6">
                <div className="absolute left-6 top-[-4px] z-10">
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
                    <Link href="/" className="relative z-10">
                        Relay
                    </Link>
                </h1>
                <div className="absolute right-6 top-[-4px] z-10">
                    {userState.loggedIn ? (
                        <Button
                            type="button"
                            className="flex justify-center items-center"
                            onClick={logoutClickHandler}
                        >
                            <RiLogoutBoxLine /> Log out
                        </Button>
                    ) : (
                        <Button type="button" className="flex justify-center items-center">
                            <Link
                                href="/login"
                                className="flex justify-center items-center gap-2 relative z-10"
                            >
                                <RiLoginBoxLine /> Log in
                            </Link>
                        </Button>
                    )}
                </div>
            </header>
            <div className="h-full w-full flex flex-col justify-center items-center load-in">
                <UserContext.Provider value={{ userState, setUserState }}>
                    {children}
                </UserContext.Provider>
            </div>
            <footer className="w-full flex flex-col justify-center items-center relative mb-6">
                <div className="flex justify-center items-center gap-[20px]">
                    <p className="text-sm w-fit">Made with a pinch of Pepper</p>
                    <a href="https://github.com/0x5b62656e5d/relay" target="_blank">
                        <RiGithubFill />
                    </a>
                </div>
                {brokenStyling && <p className="text-sm">Styles may break on mobile/vertical screens</p>}
            </footer>
        </>
    );
}
