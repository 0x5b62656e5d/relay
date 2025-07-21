import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { RiGithubFill } from "@remixicon/react";

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Relay",
    description: "A URL shortener built with NextJS and Rust",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} antialiased h-screen w-screen`}>
                <div className="h-full w-full flex flex-col justify-center items-center load-in">
                    {children}
                </div>
                <footer className="w-full flex justify-center items-center gap-[20px] absolute bottom-0 mb-6">
                    <p className="text-sm w-fit">Made with a pinch of Pepper</p>
                    <a href="https://github.com/0x5b62656e5d/relay" target="_blank">
                        <RiGithubFill />
                    </a>
                </footer>
            </body>
        </html>
    );
}
