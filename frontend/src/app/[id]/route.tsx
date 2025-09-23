import api from "@/util/api";
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface OgTags {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    siteName?: string;
    card?: string;
}

type Params = Promise<{ id: string }>;

async function fetchHeadHtml(url: string): Promise<string | null> {
    const res = await fetch(url, {
        redirect: "follow",
        headers: {
            "User-Agent": "RelayBot/1.0 (+https://relay.pepper.fyi)",
        },
    });

    if (!res.ok || !res.body) {
        return null;
    }

    const reader = res.body.getReader();
    let headHtml = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        headHtml += new TextDecoder().decode(value);

        if (headHtml.includes("</head>")) {
            break;
        }
    }

    return headHtml;
}

function extractOgTags(html: string) {
    const $ = cheerio.load(html);
    const tags: Record<string, string> = {};

    $("meta").each((_, el) => {
        const property = $(el).attr("property") || $(el).attr("name");
        const content = $(el).attr("content");
        if (property && content) {
            tags[property.toLowerCase()] = content;
        }
    });

    return {
        title: tags["og:title"],
        description: tags["og:description"],
        image: tags["og:image"],
        url: tags["og:url"],
        siteName: tags["og:site_name"],
        card: tags["twitter:card"],
    };
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
    const { id } = await params;

    try {
        const res = await api.get(`/url/link/${id}`);

        const url = res.data.data;

        const userAgent = request.headers.get("user-agent") || "";
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
