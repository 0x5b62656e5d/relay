import { formatDate } from "@/util/date";
import { UrlData, UrlClick } from "@/util/types";

export default function ClickTable({
    url,
}: {
    url: { url_data: UrlData | null; url_clicks: UrlClick[] | null };
}) {
    return (
        <table className="w-full h-full table-auto border-collapse border rounded border-[var(--foreground)]">
            <thead>
                <tr>
                    <th className="border border-[var(--foreground)] p-2">Date clicked</th>
                    <th className="border border-[var(--foreground)] p-2">Country</th>
                    <th className="border border-[var(--foreground)] p-2">Bot</th>
                </tr>
            </thead>
            <tbody>
                {url.url_clicks && url.url_clicks.length > 0 ? (
                    url.url_clicks.map((click, index) => (
                        <tr key={index}>
                            <td className="border border-[var(--foreground)] p-2 text-center">
                                {formatDate(click.clicked_at)}
                            </td>
                            <td className="border border-[var(--foreground)] p-2 text-center">
                                {click.country || "Unknown"}
                            </td>
                            <td className="border border-[var(--foreground)] p-2 text-center">
                                {click.is_bot ? "Yes" : "No"}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td
                            className="border border-[var(--foreground)] p-2 text-center"
                            colSpan={3}
                        >
                            This URL hasn&apos;t been clicked yet :c
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
