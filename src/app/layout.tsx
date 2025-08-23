import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import Topbar from "@/components/topbar";
import { Providers } from "@/components/wagmiprovider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "0xGallery",
	description:
		"Explore, buy, and sell unique digital assets on our premium NFT marketplace",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-pink-400 via-pink-200 to-pink-100 min-h-screen text-gray-800`}
				suppressContentEditableWarning
				suppressHydrationWarning
			>
				<Providers>
					<Topbar />
					<main className="w-full mx-auto px-4 sm:px-6 lg:px-5 py-8 mt-4">
						{children}
					</main>
					<Footer />
				</Providers>
			</body>
		</html>
	);
}
