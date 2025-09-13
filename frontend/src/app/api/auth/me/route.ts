import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import StandardResponse from "@/util/types";
import { isAxiosError } from "axios";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const cookieValue = request.cookies.get("__Host-access") as RequestCookie;

        if (!cookieValue) {
            const response: StandardResponse = {
                success: false,
                message: null,
                data: null,
                error: "No access cookie found",
            };

            return NextResponse.json(response, { status: 401 });
        }

        const res = await api.post("/auth/me", undefined, {
            headers: {
                Cookie: `__Host-access=${cookieValue.value ?? ""}`,
            },
        });

        return NextResponse.json(res.data, { status: 200 });
    } catch (error) {
        return handleAxiosError(error, "An error occurred while fetching the user data");
    }
}
