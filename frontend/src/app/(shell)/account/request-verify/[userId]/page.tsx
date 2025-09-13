"use client";
import { useEffect, useState } from "react";

import { StatusMessage } from "@/util/types";
import { useParams } from "next/navigation";

export default function RequestVerify() {
    const { userId } = useParams();
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState<StatusMessage>({
        success: null,
        message: null,
    });

    useEffect(() => {
        setLoading(true);

        (async () => {
            if (!userId) return;

            const res = await fetch(`/api/auth/request-verify/${userId}`, {
                method: "POST",
            });

            if (res.ok) {
                setStatusMessage({
                    success: true,
                    message: "Success! Please check your email for further instructions.",
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
    }, [userId]);

    return (
        <>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <p
                    className={`text-center mt-4 text-${
                        statusMessage.success ? "green-600" : "red-500"
                    } fade-in ${statusMessage.message ? "opacity-100" : "opacity-0"}`}
                >
                    {statusMessage.message}
                </p>
            )}
        </>
    );
}
