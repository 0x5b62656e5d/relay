"use client";
import { useEffect, useState } from "react";

import { Button } from "@/app/components/Button";
import { StatusMessage } from "@/util/types";
import Link from "next/link";
import { useParams } from "next/navigation";

interface LoginType {
    password: string;
    confirmPassword: string;
}

export default function Login() {
    const { key } = useParams();
    const [formData, setFormData] = useState<LoginType>({ password: "", confirmPassword: "" });
    const [loading, setLoading] = useState<boolean>(false);
    const [verifiedKey, setVerifiedKey] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<StatusMessage>({
        success: null,
        message: null,
    });

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/auth/verify-reset/${key}`, {
                method: "POST",
            });

            if (res.ok) {
                setVerifiedKey(true);
            } else {
                setStatusMessage({
                    success: false,
                    message: "Invalid or expired reset key.",
                });
            }
        })();
    }, [key]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        setStatusMessage({ success: null, message: null });
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setStatusMessage({ success: false, message: "Passwords do not match." });
            setLoading(false);
            return;
        }

        const res = await fetch(`/api/auth/verify-reset/${key}`, {
            method: "POST",
        });

        if (!res.ok) {
            const json = await res.json();
            setStatusMessage({ success: false, message: json.error || "Something went wrong" });
            setLoading(false);
            return;
        }

        const res2 = await fetch(`/api/auth/reset-password/${key}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                password: formData.password,
            }),
        });

        if (!res2.ok) {
            const json = await res.json();
            setStatusMessage({ success: false, message: json.error || "Something went wrong" });
            setLoading(false);
            return;
        }

        setStatusMessage({
            success: true,
            message: "Password reset successfully! You will be redirected to login shortly.",
        });

        setLoading(false);

        setTimeout(() => {
            window.location.href = "/login";

            setStatusMessage({
                success: true,
                message: (
                    <p>
                        Password reset successfully! You will be redirected to login shortly. Click{" "}
                        <Link href="/login" className="underline">
                            here
                        </Link>{" "}
                        if you have not been redirected yet.
                    </p>
                ),
            });
        }, 3000);
    };

    return (
        <div className="flex flex-col justify-center items-center load-in gap-10">
            {verifiedKey ? (
                <>
                    <h1 className="font-bold text-2xl">Reset your Relay account password</h1>
                    <form
                        className="flex flex-col justify-center items-center gap-7 w-55"
                        onSubmit={handleSubmit}
                    >
                        <div className="relative flex flex-col justify-center items-center w-full">
                            <label className="w-full" htmlFor="password">
                                Password:
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="chocolates123!"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                required
                                aria-required="true"
                            />
                            <span className="input-border" />
                        </div>
                        <div className="relative flex flex-col justify-center items-center w-full">
                            <label className="w-full" htmlFor="confirmPassword">
                                Password:
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="chocolates123!"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                                required
                                aria-required="true"
                            />
                            <span className="input-border" />
                        </div>
                        <Button type="submit" text="Reset password" loading={loading} />

                        <p
                            className={`text-center mt-4 ${
                                statusMessage.success ? "text-green-500" : "text-red-500"
                            } fade-in ${statusMessage.message ? "opacity-100" : "opacity-0"}`}
                        >
                            {statusMessage.message}
                        </p>
                    </form>
                </>
            ) : (
                <>
                    {statusMessage.success !== null && !statusMessage.success ? (
                        <div className="mt-4 text-red-500 text-center">
                            <p>{statusMessage.message}</p>
                        </div>
                    ) : (
                        <div className="mt-4 text-center">
                            <p>Verifying your reset key...</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
