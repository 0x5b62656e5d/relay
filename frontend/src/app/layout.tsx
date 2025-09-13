import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

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
                <div className="h-full w-full flex flex-col justify-center items-center load-in overflow-y-auto">
                    {children}
                </div>
            </body>
        </html>
    );
}
