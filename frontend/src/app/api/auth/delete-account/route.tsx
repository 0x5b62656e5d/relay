import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const res = await api.post("/auth/delete-account", { ...(await request.json()) });

        return NextResponse.json(res.data, { status: 200 });
    } catch (error) {
        return handleAxiosError(error, "An error occurred while deleting the account");
    }
}
