import api from "@/util/api";
import StandardResponse from "@/util/types";
import axios from "axios";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const cookieValue = (request.cookies.get("__Host-access") as RequestCookie);

        if (!cookieValue) {
            let response: StandardResponse = {
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
        if (axios.isAxiosError(error) && error.response) {
            console.error("Error response from server:", error.response.data);
            if (error.response.status === 500) {
                let response: StandardResponse = {
                    success: false,
                    message: "A server error occurred. Please try again later.",
                    data: null,
                    error: null,
                };

                return NextResponse.json(response, { status: 500 });
            }

            let response: StandardResponse = {
                success: false,
                message: null,
                data: null,
                error: error.response.data.error,
            };

            return NextResponse.json(response, { status: error.response.status });
        } else {
            console.error("Unexpected error:", error);

            let response: StandardResponse = {
                success: false,
                message: null,
                data: null,
                error: "An unexpected error occurred while signing up",
            };
            return NextResponse.json(response, { status: 500 });
        }
    }
}
