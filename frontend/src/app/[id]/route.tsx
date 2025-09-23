import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import StandardResponse from "@/util/types";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    const { id } = await params;

    try {
        const res = await api.get(`/url/link/${id}`);

        const url = res.data.data;

        const userAgent = request.headers.get("user-agent") || "";
        const isBot = /bot|crawler|spider|crawling/i.test(userAgent.toLowerCase());

        if (!isBot) {
            return NextResponse.redirect(url.includes("://") ? url : `https://${url}`);
        }

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta property="og:title" content="Relay Shortener" />
                <meta property="og:description" content="Redirecting to ${url}" />
                <meta property="og:url" content="${url}" />
                <meta property="og:type" content="website" />
            </head>
            <body>
                <p>Redirecting to <a href="${url}">${url}</a></p>
            </body>
            </html>
        `;

        return new NextResponse(html, {
            headers: { "Content-Type": "text/html" },
        });
    } catch (error) {
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            </head>
            <body>
                <p>Either the URL doesn't exist or something went wrong.</p>
                <p><a href="/">Go home</a></p>
            </body>
            </html>
        `;

        return new NextResponse(html, {
            headers: { "Content-Type": "text/html" },
        });
    }
}
