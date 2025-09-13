"use client";
import { UrlClick } from "@/util/types";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions,
    BarElement,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { startOfDay } from "date-fns";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend, BarElement);

function toDailyCounts(clicks: UrlClick[]): { x: Date; y: number }[] {
    const counts = new Map<number, number>();

    for (const c of clicks) {
        const d = new Date(c.clicked_at);
        const dayStart = startOfDay(d).getTime();
        counts.set(dayStart, (counts.get(dayStart) ?? 0) + 1);
    }

    return Array.from(counts.entries())
        .sort(([a], [b]) => a - b)
        .map(([ms, count]) => ({ x: new Date(ms), y: count }));
}

export default function ClicksLineChart({
    clicks,
    foreground,
}: {
    clicks: UrlClick[];
    foreground: string;
}) {
    const points = toDailyCounts(clicks);

    const maxY = points.length > 0 ? Math.max(...points.map(p => p.y)) : 0;
    const suggestedMax = maxY > 0 ? maxY + Math.ceil(maxY * 0.2) : 1;

    const data: ChartData<"bar", { x: Date; y: number }[], unknown> = {
        datasets: [
            {
                label: "Clicks",
                data: points,
                borderColor: foreground,
                backgroundColor: `${foreground}`,
                borderRadius: 6,
            },
        ],
    };

    const options: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    color: foreground,
                },
            },
            title: {
                display: true,
                text: "Clicks",
                color: foreground,
            },
            tooltip: {
                mode: "index",
                intersect: false,
            },
        },
        scales: {
            x: {
                type: "time",
                time: {
                    unit: "day",
                },
                title: {
                    display: true,
                    text: "Date",
                    color: foreground,
                },
                ticks: {
                    color: foreground,
                },
                grid: {
                    color: `${foreground}40`,
                },
            },
            y: {
                beginAtZero: true,
                suggestedMax,
                title: {
                    display: true,
                    text: "Clicks",
                    color: foreground,
                },
                ticks: {
                    precision: 0,
                    stepSize: 1,
                    color: foreground,
                },
                grid: {
                    color: `${foreground}40`,
                },
            },
        },
        interaction: {
            mode: "nearest",
            intersect: false,
        },
    };

    return <Bar options={options} data={data} />;
}
