import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import api from "@/util/api";

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Relay",
    description: "A URL shortener built with NextJS and Rust",
};


export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} antialiased h-screen w-screen`}>
                {/* <Header loggedIn={false} /> */}
                <div className="h-full w-full flex flex-col justify-center items-center load-in">
                    {children}
                </div>
            </body>
        </html>
    );
}
