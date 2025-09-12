import api from "@/util/api";
import StandardResponse from "@/util/types";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { key: string } }) {
    const { key } = await params;

    if (!key) {
        let response: StandardResponse = {
            success: false,
            message: null,
            data: null,
            error: "No key provided",
        };

        return NextResponse.json(response, { status: 400 });
    }

    try {
        const res = await api.post(`/auth/verify/${key}`);

        return NextResponse.json(res.data, { status: 200 });
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
                error: error.response.data.error || "An error occurred while verifying the account",
            };

            return NextResponse.json(response, { status: 404 });
        } else {
            console.error("Unexpected error:", error);
            let response: StandardResponse = {
                success: false,
                message: null,
                data: null,
                error: "An unexpected error occurred while verifying the account",
            };
            return NextResponse.json(response, { status: 500 });
        }
    }
}
