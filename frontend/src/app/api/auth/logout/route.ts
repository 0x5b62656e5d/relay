import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import StandardResponse from "@/util/types";
import { AxiosHeaders, isAxiosError } from "axios";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const logoutRes = await api.post("/auth/logout");

        const res = NextResponse.json(logoutRes.data, { status: 200 });

        const setCookie = (logoutRes.headers as AxiosHeaders).get("set-cookie") as Array<string>[0];

        res.headers.append("Set-Cookie", setCookie);

        return res;
    } catch (error) {
        return handleAxiosError(error, "An error occurred while logging out");
    }
}
