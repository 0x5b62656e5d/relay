import api from "@/util/api";
import StandardResponse from "@/util/types";
import axios, { AxiosHeaders } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();

    try {
        const loginRes = await api.post("/auth/login", {
            email,
            password,
        });

        const res = NextResponse.json(loginRes.data, { status: 200 });

        const setCookie = (loginRes.headers as AxiosHeaders).get("set-cookie") as Array<string>[0];

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
                error: error.response.data.message,
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
