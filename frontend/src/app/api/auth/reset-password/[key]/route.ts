import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import StandardResponse from "@/util/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { key: string } }) {
    const { key } = await params;
    const { password } = (await request.json()) as { password: string };

    if (!key) {
        const response: StandardResponse = {
            success: false,
            message: null,
            data: null,
            error: "No key provided",
        };

        return NextResponse.json(response, { status: 400 });
    } else if (!password) {
        const response: StandardResponse = {
            success: false,
            message: null,
            data: null,
            error: "No password provided",
        };

        return NextResponse.json(response, { status: 400 });
    }

    try {
        const res = await api.post(`/auth/reset-password/${key}`, {
            new_password: password,
        });

        return NextResponse.json(res.data, { status: 200 });
    } catch (error) {
        return handleAxiosError(error, "An error occurred while resetting the password");
    }
}
