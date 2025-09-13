import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();

    try {
        const res = await api.post("/auth/create-account", {
            email,
            name,
            password,
        });

        return NextResponse.json(res.data, { status: 200 });
    } catch (error) {
        return handleAxiosError(error, "An error occurred while signing up");
    }
}
