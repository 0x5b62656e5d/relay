"use server";
import api from "@/util/api";
import axios from "axios";

export const signup = async (email: string, name: string, password: string) => {
    console.log("signing up");
    
    try {
        await api.post("/auth/create-account", {
            email,
            name,
            password,
        });

        return { message: "Success! Check your email to verify your account.", error: null };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("Error response from server:", error.response.data);
            if (error.response.status === 500) {
                return { message: "", error: "A server error occurred. Please try again later." };
            }

            return { message: "", error: error.response.data };
        } else {
            console.error("Unexpected error:", error);
            return { message: "", error: "An unexpected error occurred while signing up" };
        }
    }
};
