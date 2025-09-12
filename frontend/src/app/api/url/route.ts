import api from "@/util/api";
import StandardResponse from "@/util/types";
import { isAxiosError } from "axios";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const cookieValue = request.cookies.get("__Host-access") as RequestCookie;

        const res = await api.post(
            "/url",
            { ...(await request.json()) },
            {
                headers: {
                    Cookie: `__Host-access=${cookieValue.value ?? ""}`,
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
        if (isAxiosError(error) && error.response) {
            console.error("Error response from server:", error.response.data);
            const response: StandardResponse = {
                success: false,
                message: null,
                data: null,
                error: error.response.data.error || "An error occurred while shortening the URL",
            };

            return NextResponse.json(response, { status: error.response.status });
        } else {
            console.error("Unexpected error:", error);
            const response: StandardResponse = {
                success: false,
                message: null,
                data: null,
                error: "An unexpected error occurred while shortening the URL",
            };
            return NextResponse.json(response, { status: 500 });
        }
    }
}
