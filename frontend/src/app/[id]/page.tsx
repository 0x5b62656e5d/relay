"use client";
import { getUrlById } from "@/util/api";
import { redirect } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
    const params = useParams<{ id: string }>();
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
        (async () => {
            try {
                const fetchedUrl = await getUrlById(params.id);
                setUrl(fetchedUrl);
            } catch (error) {
                console.error("Error fetching URL:", error);
                setUrl("");
            }
        })();
    }, [params.id]);

    if (url !== "") {
        redirect(url);
    }

    return <h1>Redirecting...</h1>;
}
