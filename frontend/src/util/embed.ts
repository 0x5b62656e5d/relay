import * as cheerio from "cheerio";

export const fetchHeadHtml = async (url: string): Promise<string | null> => {
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
};

export const extractOgTags = (html: string) => {
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
};
