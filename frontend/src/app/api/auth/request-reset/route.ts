import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { email } = (await request.json()) as { email: string };

    try {
        const response = await api.post("/auth/request-reset", { email });
        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        return handleAxiosError(error, "An error occurred while requesting account password reset");
    }
}
