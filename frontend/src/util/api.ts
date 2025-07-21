"use server";
import axios from "axios";

const api = axios.create({
    baseURL: process.env.BACKEND_URL,
});

interface ShortenUrlResponse {
    urlId: string;
    error?: string;
}

export const shortenUrl = async (url: string): Promise<ShortenUrlResponse> => {
    try {
        return { urlId: (await api.post("/url", { url })).data.data };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Error response from server:", error.response.data);
            return { urlId: "", error: error.response.data };
        } else {
            console.error("Unexpected error:", error);
            return { urlId: "", error: "An unexpected error occurred while shortening the URL" };
        }
    }
};

export const getUrlById = async (id: string): Promise<string> => {
    try {
        return (await api.get(`/url/${id}`)).data.data.url;
    } catch (error) {
        console.error("Error fetching URL by ID:", error);
        throw error;
    }
};
