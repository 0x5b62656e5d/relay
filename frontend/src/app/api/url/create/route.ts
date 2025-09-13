import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import StandardResponse from "@/util/types";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const cookieValue = request.cookies.get("__Host-access") as RequestCookie;

        const res = await api.post(
            "/url/create",
            { ...(await request.json()) },
            {
                headers: {
                    Cookie: `__Host-access=${cookieValue?.value ?? ""}`,
                },
            },
        );

        const response: StandardResponse = {
            success: true,
            message: null,
            data: { urlId: res.data.data },
            error: null,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        return handleAxiosError(error, "An error occurred while shortening the URL");
    }
}
