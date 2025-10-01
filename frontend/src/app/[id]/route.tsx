import api from "@/util/api";
import { fetchHeadHtml, extractOgTags } from "@/util/embed";
import { NextRequest, NextResponse } from "next/server";

interface OgTags {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    siteName?: string;
    card?: string;
}

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    const { id } = await params;

    try {
        const userAgent = request.headers.get("user-agent") || "";

        const res = await api.get(`/url/link/${id}`, {
            headers: {
                "User-Agent": userAgent,
                "CF-IPCountry": request.headers.get("CF-IPCountry") || "Unknown",
            },
        });

        const url = res.data.data;

        const correctedUrl = url.includes("://") ? url : `https://${url}`;

        if (!/bot|crawler|spider|crawling/i.test(userAgent.toLowerCase())) {
            return NextResponse.redirect(correctedUrl);
        }

        const headHtml = await fetchHeadHtml(correctedUrl);
        const og: OgTags = headHtml ? extractOgTags(headHtml) : {};

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta property="og:title" content="${og.title || "Relay Shortener"}" />
            <meta property="og:description" content="${og.description || "Redirecting"}" />
            <meta property="og:url" content="${og.url || correctedUrl}" />
            ${og.image ? `<meta property="og:image" content="${og.image}" />` : ""}
            ${og.siteName ? `<meta property="og:site_name" content="${og.siteName}" />` : ""}
            <meta name="twitter:card" content="${og.card || "summary_large_image"}" />
            </head>
            <body>
            <p>Redirecting to <a href="${correctedUrl}">${correctedUrl}</a></p>
            </body>
            </html>
        `;

        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html",
                "Cache-Control": "public, s-maxage=3600, max-age=0",
            },
        });
    } catch {
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
