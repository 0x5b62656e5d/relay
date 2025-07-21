import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

export const shortenUrl = async (url: string): Promise<string> => {
    try {
        return (await api.post("/url", { url })).data.data;
    } catch (error) {
        console.error("Error shortening URL:", error);
        throw error;
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
