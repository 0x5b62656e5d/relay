import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const cookieValue = request.cookies.get("__Host-access") as RequestCookie;

        const res = await api.get("/url/count", {
            headers: {
                Cookie: `__Host-access=${cookieValue?.value ?? ""}`,
            },
        });

        return NextResponse.json(res.data, { status: 200 });
    } catch (error) {
        return handleAxiosError(error, "An error occurred while fetching the URLs");
    }
}
