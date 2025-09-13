import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import StandardResponse from "@/util/types";
import { AxiosHeaders, isAxiosError } from "axios";
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
        return handleAxiosError(error, "An error occurred while logging in");
    }
}
