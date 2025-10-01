"use client";
import { useEffect, useState } from "react";

import { Button } from "@/app/components/Button";
import { StatusMessage } from "@/util/types";
import { RiCloseLine } from "@remixicon/react";
import { redirect } from "next/navigation";
import { createPortal } from "react-dom";

interface DeleteAccountType {
    password: string;
    confirmPassword: string;
}

export default function ManageAccount() {
    const [formData, setFormData] = useState<DeleteAccountType>({
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [computedStyle, setComputedStyle] = useState<CSSStyleDeclaration | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [statusMessageAccDel, setStatusMessageAccDel] = useState<StatusMessage>({
        success: null,
        message: null,
    });
    const [statusMessagePwReset, setStatusMessagePwReset] = useState<StatusMessage>({
        success: null,
        message: null,
    });

    useEffect(() => {
        setComputedStyle(window.getComputedStyle(document.documentElement));
    }, []);

    useEffect(() => {
        if (!showDeleteModal) {
            return;
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setShowDeleteModal(false);
            }
        };

        window.addEventListener("keydown", onKey);

        return () => window.removeEventListener("keydown", onKey);
    }, [showDeleteModal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const requestPasswordReset = async () => {
        setLoading(true);
        setStatusMessagePwReset({ success: null, message: null });

        const res = await fetch("/api/auth/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            setStatusMessagePwReset({
                success: false,
                message: "Something went wrong while requesting a password reset",
            });
            setLoading(false);
            return;
        }

        const json = await res.json();

        const res2 = await fetch("/api/auth/request-reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: json.data.email,
            }),
        });

        if (!res2.ok) {
            const json2 = await res2.json();
            setStatusMessagePwReset({
                success: false,
                message: json2.error || "Something went wrong while requesting a password reset",
            });
            setLoading(false);
            return;
        }

        setStatusMessagePwReset({
            success: true,
            message: "Success! Please check your email for further instructions.",
        });
        setLoading(false);
    };

    const deleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        setStatusMessageAccDel({ success: null, message: null });

        if (formData.password !== formData.confirmPassword) {
            setStatusMessageAccDel({ success: false, message: "Passwords do not match" });
            setLoading(false);
            return;
        }

        if (
            !confirm("Are you sure you want to delete your account? This action cannot be undone.")
        ) {
            return;
        }

        const res = await fetch("/api/auth/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            setStatusMessagePwReset({
                success: false,
                message: "Something went wrong while requesting a password reset",
            });
            setLoading(false);
            return;
        }

        const json = await res.json();

        const res2 = await fetch("/api/auth/delete-account", {
            method: "POST",
            body: JSON.stringify({
                email: json.data.email,
                password: formData.password,
            }),
        });

        const json2 = await res2.json();

        if (!res2.ok) {
            setStatusMessageAccDel({
                success: false,
                message: json2.error || "Something went wrong while requesting account deletion",
            });
            setLoading(false);
            return;
        }

        setLoading(false);
        redirect("/login");
    };

    return (
        <div className="w-full h-full flex flex-col justify-center items-center gap-6 load-in">
            <Button type="button" onClick={requestPasswordReset} loading={loading}>
                Change account password
            </Button>
            <Button type="button" onClick={() => setShowDeleteModal(true)} loading={loading}>
                Delete account
            </Button>
            <p
                className={`text-center ${
                    statusMessagePwReset.success ? "text-green-500" : "text-red-500"
                } fade-in ${statusMessagePwReset.message ? "opacity-100" : "opacity-0"} w-[80%]`}
            >
                {statusMessagePwReset.message}
            </p>
            {computedStyle &&
                createPortal(
                    <div className={`modal ${showDeleteModal ? "modal-show" : ""} fade-in`}>
                        <div
                            className="modal-bg"
                            onClick={e => {
                                if (e.target === e.currentTarget) {
                                    setShowDeleteModal(false);
                                }
                            }}
                        />
                        <div className="relative flex flex-col justify-center items-center p-12 rounded border border-white bg-[var(--background)] z-200">
                            <form
                                className="flex flex-col justify-center items-center gap-7 w-55"
                                onSubmit={deleteAccount}
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
                                </div>
                                <div className="relative flex flex-col justify-center items-center w-full">
                                    <label className="w-full" htmlFor="confirmPassword">
                                        Confirm password:
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
                                </div>
                                <Button type="submit" text="Delete account" loading={loading} />

                                <p
                                    className={`text-center ${
                                        statusMessageAccDel.success
                                            ? "text-green-500"
                                            : "text-red-500"
                                    } fade-in ${statusMessageAccDel.message ? "opacity-100" : "opacity-0"}`}
                                >
                                    {statusMessageAccDel.message}
                                </p>
                            </form>
                            <button
                                className="absolute top-0 left-0 m-4 z-110"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                <RiCloseLine />
                            </button>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
