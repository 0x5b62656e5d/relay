import api from "@/util/api";
import { handleAxiosError } from "@/util/axiosError";
import StandardResponse from "@/util/types";
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
        return handleAxiosError(error, "An error occurred while deleting the URL");
    }
}
