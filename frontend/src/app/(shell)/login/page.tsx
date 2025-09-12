"use client";
import { useContext, useEffect, useState } from "react";

import { UserContext } from "@/app/(shell)/layout";
import { Button } from "@/app/components/Button";
import { StatusMessage } from "@/util/types";
import Link from "next/link";
import { redirect } from "next/navigation";

interface LoginType {
    email: string;
    password: string;
}

export default function Login() {
    const [formData, setFormData] = useState<LoginType>({ email: "", password: "" });
    const [loading, setLoading] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<StatusMessage>({
        success: null,
        message: null,
    });
    const { setUserState } = useContext(UserContext);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/auth/me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                redirect("/dashboard");
            }
        })();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        setStatusMessage({ success: null, message: null });
        e.preventDefault();

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
            }),
        });

        if (!res.ok) {
            const json = await res.json();
            setStatusMessage({
                success: false,
                message: json.error || "Something went wrong",
            });
            setLoading(false);
            return;
        }

        const res2 = await fetch("/api/auth/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        setLoading(false);
        setUserState({ name: (await res2.json()).data.name, loggedIn: true });
        redirect("/dashboard");
    };

    return (
        <div className="flex flex-col justify-center items-center load-in gap-10">
            <h1 className="font-bold text-2xl">Login to Relay</h1>
            <form
                className="flex flex-col justify-center items-center gap-7 w-55"
                onSubmit={handleSubmit}
            >
                <div className="relative flex flex-col justify-center items-center w-full">
                    <label className="w-full" htmlFor="email">
                        Email:
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        aria-required="true"
                    />
                    <span className="input-border" />
                </div>
                <div className="relative flex flex-col justify-center items-center w-full">
                    <label className="w-full" htmlFor="password">
                        Password:
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        aria-required="true"
                    />
                    <span className="input-border" />
                </div>
                <Button type="submit" text="Log in" loading={loading} />

                <p
                    className={`text-center text-${
                        statusMessage.success ? "green-600" : "red-500"
                    } fade-in ${statusMessage.message ? "opacity-100" : "opacity-0"}`}
                >
                    {statusMessage.message}
                </p>
            </form>
            <div className="flex flex-col justify-center items-center gap-2">
                <div className="flex flex-col justify-center items-center gap-1">
                    <p>Don&apos;t have an account?</p>
                    <p>
                        Create one{" "}
                        <Link href="/signup">
                            <b>
                                <u>here</u>
                            </b>
                        </Link>
                    </p>
                </div>
                <p>
                    <Link href="/account/request-reset">
                        <b>
                            <u>Forgot password?</u>
                        </b>
                    </Link>
                </p>
            </div>
        </div>
    );
}
