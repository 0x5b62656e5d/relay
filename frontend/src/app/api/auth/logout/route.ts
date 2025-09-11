import api from "@/util/api";
import StandardResponse from "@/util/types";
import axios, { AxiosHeaders } from "axios";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const logoutRes = await api.post("/auth/logout");

        const res = NextResponse.json(logoutRes.data, { status: 200 });

        const setCookie = (logoutRes.headers as AxiosHeaders).get("set-cookie") as Array<string>[0];

        res.headers.append("Set-Cookie", setCookie);

        return res;
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
                error: "An unexpected error occurred while signing out",
            };
            return NextResponse.json(response, { status: 500 });
        }
    }
}
