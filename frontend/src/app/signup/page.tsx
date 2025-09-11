"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import { signup } from "../backend/auth";

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

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        } else if (!/^[\p{L} ]+$/u.test(formData.name)) {
            setError("Name can only contain letters and spaces");
            setLoading(false);
            return;
        }

        await signup(formData.email, formData.name, formData.password).then(res => {
            if (res.error) {
                setError(res.error);
            } else {
                setSuccess(res.message);
            }
        });

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
