import api from "@/util/api";
import StandardResponse from "@/util/types";
import { isAxiosError } from "axios";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;

    try {
        const cookieValue = request.cookies.get("__Host-access") as RequestCookie;

        await api.delete(`/url/delete/${id}`, {
            headers: {
                Cookie: `__Host-access=${cookieValue?.value ?? ""}`,
            },
        });

        const response: StandardResponse = {
            success: true,
            message: null,
            data: null,
            error: null,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.error("Error response from server:", error.response.data);
            const response: StandardResponse = {
                success: false,
                message: null,
                data: null,
                error: error.response.data.error || "An error occurred while deleting the URL",
            };

            return NextResponse.json(response, { status: error.response.status });
        } else {
            console.error("Unexpected error:", error);
            const response: StandardResponse = {
                success: false,
                message: null,
                data: null,
                error: "An unexpected error occurred while deleting the URL",
            };
            return NextResponse.json(response, { status: 500 });
        }
    }
}
