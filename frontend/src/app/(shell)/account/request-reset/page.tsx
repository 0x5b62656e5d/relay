"use client";
import { useState } from "react";

import { Button } from "@/app/components/Button";
import { StatusMessage } from "@/util/types";

interface LoginType {
    email: string;
}

export default function Login() {
    const [formData, setFormData] = useState<LoginType>({ email: "" });
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

        const res = await fetch("/api/auth/request-reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: formData.email,
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

        setStatusMessage({
            success: true,
            message: "Success! Please check your email for further instructions.",
        });

        setLoading(false);
    };

    return (
        <div className="flex flex-col justify-center items-center load-in gap-10">
            <h1 className="font-bold text-2xl">Request a password reset</h1>
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
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        aria-required="true"
                    />
                    <span className="input-border" />
                </div>
                <Button type="submit" text="Send request" loading={loading} />

                <p
                    className={`text-center mt-4 ${
                        statusMessage.success ? "text-green-500" : "text-red-500"
                    } fade-in ${statusMessage.message ? "opacity-100" : "opacity-0"}`}
                >
                    {statusMessage.message}
                </p>
            </form>
        </div>
    );
}
