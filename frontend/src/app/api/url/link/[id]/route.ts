import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import StandardResponse from "@/util/types";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
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
