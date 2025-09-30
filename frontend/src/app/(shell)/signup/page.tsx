"use client";
import { useState } from "react";

import { Button } from "@/app/components/Button";
import { StatusMessage } from "@/util/types";
import Link from "next/link";

interface SignupType {
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
}

export default function Signup() {
    const [formData, setFormData] = useState<SignupType>({
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<StatusMessage>({
        success: null,
        message: null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        setStatusMessage({ success: null, message: null });
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setStatusMessage({ success: false, message: "Passwords do not match" });
            setLoading(false);
            return;
        } else if (!/^[\p{L} ]+$/u.test(formData.name)) {
            setStatusMessage({
                success: false,
                message: "Name can only contain letters and spaces",
            });
            setLoading(false);
            return;
        }

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: formData.email,
                name: formData.name,
                password: formData.password,
            }),
        });

        if (res.ok) {
            setStatusMessage({
                success: true,
                message: "Success! Check your email to verify your account.",
            });
        } else {
            setStatusMessage({
                success: false,
                message: (await res.json()).error || "Something went wrong",
            });
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col justify-center items-center load-in gap-10">
            <h1 className="font-bold text-2xl">Sign up for Relay</h1>
            <form
                className="flex flex-col justify-center items-center gap-7 w-55"
                onSubmit={handleSubmit}
            >
                <div className="relative flex flex-col justify-center items-center w-full">
                    <label className="w-full" htmlFor="name">
                        Name:
                    </label>
                    <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        aria-required="true"
                    />
                    <span className="input-border" />
                </div>
                <div className="relative flex flex-col justify-center items-center w-full">
                    <label className="w-full" htmlFor="email">
                        Email:
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="john@example.com"
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
                        placeholder="chocolates123!"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        minLength={6}
                        maxLength={20}
                        required
                        aria-required="true"
                    />
                    <span className="input-border" />
                </div>
                <div className="relative flex flex-col justify-center items-center w-full">
                    <label className="w-full" htmlFor="confirmPassword">
                        Confirm Password:
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="chocolates123!"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                        minLength={6}
                        maxLength={20}
                        required
                        aria-required="true"
                    />
                    <span className="input-border" />
                </div>
                <div className="flex flex-col justify-center items-center w-full">
                    <Button type="submit" text="Sign up" loading={loading} />

                    <p
                        className={`text-center mt-4 ${
                            statusMessage.success ? "text-green-500" : "text-red-500"
                        } fade-in ${statusMessage.message ? "opacity-100" : "opacity-0"}`}
                    >
                        {statusMessage.message}
                    </p>
                </div>
            </form>

            <div className="flex flex-col justify-center items-center gap-2">
                <p>Have an account?</p>
                <p>
                    Sign in{" "}
                    <Link href="/login">
                        <b>
                            <u>here</u>
                        </b>
                    </Link>
                </p>
            </div>
        </div>
    );
}
