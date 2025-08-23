"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/config";

export function Providers({ children }: { children: ReactNode }) {
	const queryClient = new QueryClient();
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>{" "}
		</WagmiProvider>
	);
}
