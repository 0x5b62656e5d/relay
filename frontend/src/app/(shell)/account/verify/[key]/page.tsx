"use client";
import { useEffect, useState } from "react";

import { StatusMessage } from "@/util/types";
import { useParams } from "next/navigation";

export default function Verify() {
    const { key } = useParams();
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState<StatusMessage>({
        success: null,
        message: null,
    });

    useEffect(() => {
        setLoading(true);

        (async () => {
            if (!key) return;

            const res = await fetch(`/api/auth/verify-account/${key}`, {
                method: "POST",
            });

            if (res.ok) {
                setStatusMessage({
                    success: true,
                    message: "Success! Your account has been verified.",
                });
                setLoading(false);
            } else {
                const data = await res.json();
                setStatusMessage({
                    success: false,
                    message: data.error || "Something went wrong",
                });
                setLoading(false);
            }
        })();
    }, [key]);

    return (
        <>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <p
                    className={`text-center mt-4 ${
                        statusMessage.success ? "text-green-500" : "text-red-500"
                    } fade-in ${statusMessage.message ? "opacity-100" : "opacity-0"}`}
                >
                    {statusMessage.message}
                </p>
            )}
        </>
    );
}
