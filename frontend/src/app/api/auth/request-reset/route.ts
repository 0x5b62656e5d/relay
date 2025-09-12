import api from "@/util/api";
import StandardResponse from "@/util/types";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { email } = (await request.json()) as { email: string };

    try {
        const response = await api.post("/auth/request-reset", { email });
        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        console.log(error);
        if (
            axios.isAxiosError(error) &&
            (error.status ? error.status : 0) < 400 &&
            error.response
        ) {
            let response: StandardResponse = {
                success: false,
                message: null,
                data: null,
                error:
                    error.response.data.error ||
                    "An error occurred while requesting account password reset",
            };

            return NextResponse.json(response, { status: 404 });
        } else {
            console.error("Unexpected error:", error);
            let response: StandardResponse = {
                success: false,
                message: null,
                data: null,
                error: "An unexpected error occurred while requesting account password reset",
            };
            return NextResponse.json(response, { status: 500 });
        }
    }
}
