import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import StandardResponse from "@/util/types";
import { isAxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
    const { userId } = await params;

    if (!userId) {
        const response: StandardResponse = {
            success: false,
            message: null,
            data: null,
            error: "No user ID provided",
        };

        return NextResponse.json(response, { status: 400 });
    }

    try {
        const res = await api.post(`/auth/request-verify/${userId}`);

        return NextResponse.json(res.data, { status: 200 });
    } catch (error) {
        return handleAxiosError(error, "An error occurred while requesting account verification");
    }
}
