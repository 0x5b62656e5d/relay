import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import StandardResponse from "@/util/types";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

export async function GET({ params }: { params: { id: string } }) {
    const { id } = await params;

    try {
        const res = await api.get(`/url/link/${id}`);

        const response: StandardResponse = {
            success: true,
            message: null,
            data: { url: res.data.data },
            error: null,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        return handleAxiosError(
            error,
            "An unexpected error occurred while fetching the original URL",
        );
    }
}
