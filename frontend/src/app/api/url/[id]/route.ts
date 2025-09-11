import api from "@/util/api";
import StandardResponse from "@/util/types";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    
    try {
        const res = await api.get(`/url/${id}`);

        let response: StandardResponse = {
            success: true,
            message: null,
            data: { url: res.data.data },
            error: null,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.log(error);
        if (axios.isAxiosError(error) && error.status === 404) {
            let response: StandardResponse = {
                success: false,
                message: null,
                data: null,
                error: "URL not found",
            };

            return NextResponse.json(response, { status: 404 });
        } else {
            console.error("Unexpected error:", error);
            let response: StandardResponse = {
                success: false,
                message: null,
                data: null,
                error: "An unexpected error occurred while fetching the URL",
            };
            return NextResponse.json(response, { status: 500 });
        }
    }
}
