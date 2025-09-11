import api from "@/util/api";
import axios from "axios";

interface ShortenUrlResponse {
    urlId: string;
    error?: string;
}

interface GetUrlResponse {
    url: string;
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

export const getUrlById = async (id: string): Promise<GetUrlResponse> => {
    try {
        return { url: (await api.get(`/url/${id}`)).data.data.url };
    } catch (error) {
        if (axios.isAxiosError(error) && error.status === 404) {
            return { url: "", error: "The requested URL is not found!" };
        } else {
            console.error("Unexpected error:", error);
            return { url: "", error: "An unexpected error occurred while fetching the URL" };
        }
    }
};
