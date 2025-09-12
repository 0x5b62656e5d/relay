"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import { Button } from "@/app/components/Button";

interface LoginType {
    password: string;
    confirmPassword: string;
}

export default function Login() {
    const { key } = useParams();
    const [formData, setFormData] = useState<LoginType>({ password: "", confirmPassword: "" });
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [verifiedKey, setVerifiedKey] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/auth/verify-reset/${key}`, {
                method: "POST",
            });

            if (res.ok) {
                setVerifiedKey(true);
            } else {
                setError("Invalid or expired reset key.");
            }
        })();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        const res = await fetch(`/api/auth/verify-reset/${key}`, {
            method: "POST",
        });

        if (!res.ok) {
            const json = await res.json();
            setError(json.error);
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
            setError(json.error);
            setLoading(false);
            return;
        }

        setSuccess("Password reset successfully!");

        setLoading(false);
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
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                                required
                                aria-required="true"
                            />
                            <span className="input-border" />
                        </div>
                        <Button type="submit" text="Reset password" loading={loading} />

                        {error && (
                            <div className="mt-4 text-red-500 text-center">
                                <p>Error: {error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="mt-4 text-green-500 text-center">
                                <p>Success: {success}</p>
                            </div>
                        )}
                    </form>
                </>
            ) : (
                <>
                    {error ? (
                        <div className="mt-4 text-red-500 text-center">
                            <p>Error: {error}</p>
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
