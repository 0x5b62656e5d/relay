import api from "@/util/api";
import StandardResponse from "@/util/types";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const res = await api.post("/url", { ...(await request.json()) });

        let response: StandardResponse = {
            success: true,
            message: null,
            data: { urlId: res.data.data },
            error: null,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Error response from server:", error.response.data);
            return { urlId: "", error: error.response.data };
        } else {
            console.error("Unexpected error:", error);
            return { urlId: "", error: "An unexpected error occurred while shortening the URL" };
        }
    }
}
