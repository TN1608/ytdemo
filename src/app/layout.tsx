import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {Toaster} from "@/components/ui/sonner";
import {ThemeProvider} from "@/context/ThemeProvider";
import MiniPlayer from "@/components/MiniPlayer";
import MiniPlayerWrapper from "@/context/MiniPlayerWrapper";
import Header from "@/components/fragments/Header";
import {AuthProvider} from "@/context/AuthenticateProvider";
import {SearchProvider} from "@/context/SearchProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "YouTube Playlist Player",
    description: "A simple YouTube playlist player built with Next.js and TypeScript.",
    openGraph: {
        title: "YouTube Playlist Player",
        description: "A simple YouTube playlist player built with Next.js and TypeScript.",
        // url: "https://yourdomain.com",
        siteName: "YouTube Playlist Player",
        // images: [
        //     {
        //         url: "https://yourdomain.com/og-image.png",
        //         width: 1200,
        //         height: 630,
        //     },
        // ],
        locale: "en_US",
        type: "website",
    },
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
        >
            <AuthProvider>
                <SearchProvider>
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        {children}
                        <MiniPlayerWrapper />
                        <Toaster />
                    </div>
                </SearchProvider>
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
