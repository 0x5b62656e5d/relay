"use client";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { UserContext } from "../layout";

interface LoginType {
    email: string;
    password: string;
}

export default function Login() {
    const [formData, setFormData] = useState<LoginType>({ email: "", password: "" });
    const [loading, setLoading] = useState<boolean>(false);
    const [success, _setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { userState, setUserState } = useContext(UserContext);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/auth/me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                // router.refresh();
                redirect("/dashboard");
            }
        })();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
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
            setError(json.error);
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
            <div className="flex flex-col justify-center items-center gap-2">
                <p>Don't have an account?</p>
                <p>
                    Create one{" "}
                    <Link href="/signup">
                        <b>
                            <u>here</u>
                        </b>
                    </Link>
                </p>
            </div>
        </div>
    );
}
