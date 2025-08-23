"use client";
import { ArrowLeftRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type Connector, useAccount, useConnect, useDisconnect } from "wagmi";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function Topbar() {
	const { isConnected, address } = useAccount();
	const { disconnect } = useDisconnect();
	const [isMounted, setIsMounted] = useState(false);
	const router = useRouter();

	// This ensures we only render after component is mounted (client-side)
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Don't render anything until component is mounted to avoid hydration mismatch
	if (!isMounted) {
		return (
			<div className="w-full bg-gradient-to-r from-gray-800 via-purple-800 to-gray-800 border-b border-purple-500/30 shadow-lg">
				<div className="w-auto mx-auto flex justify-between items-center py-5 px-6">
					<div className="flex items-center gap-3">
						<img className="w-9 h-9" src="/0xgallery.png" alt="0xgallery" />
						<button
							onClick={() => router.push("/")}
							type="button"
							className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-white to-pink-300 bg-clip-text text-transparent tracking-tight"
						>
							0xGallery
						</button>
					</div>
					{/* Empty state while loading */}
					<div className="h-10"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full bg-gradient-to-r from-gray-800 via-purple-800 to-gray-800 border-b border-purple-500/30 shadow-lg">
			<div className="w-auto mx-auto flex justify-between items-center py-4 px-6">
				{/* Logo and Name - Pushed to left */}
				<div className="flex items-center gap-3">
					<img className="w-8 h-8" src="/0xgallery.png" alt="0xgallery" />
					<Link
						href="/"
						className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-white to-pink-300 bg-clip-text text-transparent tracking-tight hover:scale-102 transition-transform"
					>
						0xGallery
					</Link>
				</div>

				{/* Connection Section - Pushed to right */}
				<div className="flex items-center">
					{isConnected ? (
						<div className="flex flex-col sm:flex-row items-center gap-4">
							<Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-5 py-2.5 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-purple-500/25">
								<Link href="/list" className="flex items-center">
									List NFTs
								</Link>
							</Button>

							<Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-5 py-2.5 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-purple-500/25">
								<Link href="/mint" className="flex items-center">
									Mint NFTs
								</Link>
							</Button>

							<Badge
								variant="secondary"
								className="px-4 py-2 text-sm font-medium bg-gray-800 border border-purple-500/30 rounded-full"
							>
								<div className="flex items-center gap-2">
									<div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400"></div>
									<span className="text-gray-200">
										{address?.slice(0, 6)}...{address?.slice(-4)}
									</span>
								</div>
							</Badge>

							<Button
								variant="outline"
								onClick={() => disconnect()}
								className="gap-2 border border-gray-600 text-gray-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:text-white hover:border-purple-500 px-4 py-2.5 rounded-lg transition-colors"
							>
								<ArrowLeftRightIcon className="h-4 w-4" />
								Disconnect
							</Button>
						</div>
					) : (
						<WalletOptions />
					)}
				</div>
			</div>
		</div>
	);
}

export function WalletOptions() {
	const { connectors, connect } = useConnect();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return <div className="h-10"></div>; // Loading state
	}

	return (
		<div className="flex gap-2">
			{connectors.map((connector) => (
				<WalletOption
					key={connector.uid}
					connector={connector}
					onClick={() => connect({ connector })}
				/>
			))}
		</div>
	);
}

function WalletOption({
	connector,
	onClick,
}: {
	connector: Connector;
	onClick: () => void;
}) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		(async () => {
			const provider = await connector.getProvider();
			setReady(!!provider);
		})();
	}, [connector]);

	return (
		<Button
			type="button"
			disabled={!ready}
			onClick={onClick}
			className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300"
		>
			{connector.name}
		</Button>
	);
}
