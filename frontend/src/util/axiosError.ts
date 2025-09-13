import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

import StandardResponse from "./types";

export const handleAxiosError = (error: unknown, defaultMessage: string): NextResponse => {
    if (isAxiosError(error) && error.response) {
        console.error("Error response from server:", error.response.data);
        const response: StandardResponse = {
            success: false,
            message: null,
            data: null,
            error:
                error.status === 429
                    ? error.response.data
                    : error.response.data.error || defaultMessage,
        };

        return NextResponse.json(response, { status: error.response.status });
    } else {
        console.error("Unexpected error:", error);
        const response: StandardResponse = {
            success: false,
            message: null,
            data: null,
            error: defaultMessage,
        };
        return NextResponse.json(response, { status: 500 });
    }
};
