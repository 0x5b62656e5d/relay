"use client";
import { useState } from "react";
import { Button } from "@/app/components/Button";

interface LoginType {
    email: string;
}

export default function Login() {
    const [formData, setFormData] = useState<LoginType>({ email: "" });
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
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
            setError(json.error);
            setLoading(false);
            return;
        }

        setSuccess("Success! Please check your email for further instructions.");

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
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        aria-required="true"
                    />
                    <span className="input-border" />
                </div>
                <Button type="submit" text="Send request" loading={loading} />

                {error && (
                    <div className="mt-4 text-red-500 text-center">
                        <p>Error: {error}</p>
                    </div>
                )}
                {success && (
                    <div className="mt-4 text-green-500 text-center">
                        <p>{success}</p>
                    </div>
                )}
            </form>
        </div>
    );
}
