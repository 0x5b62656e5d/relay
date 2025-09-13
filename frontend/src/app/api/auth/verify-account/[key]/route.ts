import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import StandardResponse from "@/util/types";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ key: string }>;

export async function POST(request: NextRequest, { params }: { params: Params }) {
    const { key } = await params;

    if (!key) {
        const response: StandardResponse = {
            success: false,
            message: null,
            data: null,
            error: "No key provided",
        };

        return NextResponse.json(response, { status: 400 });
    }

    try {
        const res = await api.post(`/auth/verify/${key}`);

        return NextResponse.json(res.data, { status: 200 });
    } catch (error) {
        return handleAxiosError(error, "An error occurred while verifying the account");
    }
}
