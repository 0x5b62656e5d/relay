import { formatDate } from "@/util/date";
import { UrlData, UrlClick } from "@/util/types";
import { RiClipboardLine, RiQrCodeLine } from "@remixicon/react";

import { DashboardInfoCard } from "./DashboardInfoCard";

export default function DashboardInfoCards({
    url,
    setShowQrModal,
}: {
    url: { url_data: UrlData | null; url_clicks: UrlClick[] | null };
    setShowQrModal: (show: boolean) => void;
}) {
    const copyToClipboard = () => {
        if (!url.url_data) {
            return;
        }

        navigator.clipboard.writeText(`https://relay.pepper.fyi/${url.url_data.id}`);
    };

    return (
        <>
            <DashboardInfoCard title="URL ID">
                <div className="flex justify-center items-center gap-1">
                    <p>{url.url_data?.id} </p>
                    <button onClick={copyToClipboard}>
                        <RiClipboardLine />
                    </button>
                    <button onClick={() => setShowQrModal(true)}>
                        <RiQrCodeLine />
                    </button>
                </div>
            </DashboardInfoCard>
            <DashboardInfoCard title="Original URL">
                <p>
                    <a
                        href={
                            url.url_data?.url.includes("//")
                                ? url.url_data?.url
                                : `https://${url.url_data?.url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                    >
                        {(url.url_data?.url.length || 0) > 20
                            ? url.url_data?.url.substring(0, 18) + "..."
                            : url.url_data?.url}
                    </a>
                </p>
            </DashboardInfoCard>
            <DashboardInfoCard title="Created at">
                <p>{url.url_data?.created_at ? formatDate(url.url_data?.created_at) : "Never"}</p>
            </DashboardInfoCard>
            <DashboardInfoCard title="Last clicked">
                <p>
                    {url.url_data?.last_clicked ? formatDate(url.url_data?.last_clicked) : "Never"}
                </p>
            </DashboardInfoCard>
            <DashboardInfoCard title="Total clicks" className="col-span-2">
                <p>{url.url_data?.clicks}</p>
            </DashboardInfoCard>
        </>
    );
}
