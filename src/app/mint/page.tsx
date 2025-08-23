// app/page.tsx
"use client";

import {
	ArrowLeftRightIcon,
	GalleryHorizontal,
	SparklesIcon,
	WalletIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { MintNFTForm } from "@/components/mint-nft-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserNFTs } from "@/components/user-nfts";
import { useCollectibles } from "@/hooks/use-collectibles";

export default function Home() {
	const { isConnected, address } = useAccount();
	const { connect } = useConnect();
	const {
		isMintEnabled,
		userNFTs,
		loading,
		error,
		checkMintStatus,
		mintWithRoyalty,
	} = useCollectibles(address as string);

	useEffect(() => {
		if (isConnected) {
			checkMintStatus();
		}
	}, [isConnected, checkMintStatus]);

	return (
		<main className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30">
			<div className="container mx-auto px-4 py-8">
				{isConnected ? (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Mint Card */}
						<Card className="shadow-lg border-0 overflow-hidden bg-gradient-to-r from-purple-500/20 to-pink-500/10">
							<CardHeader className="border-b">
								<div className="flex items-center gap-2">
									<SparklesIcon className="h-5 w-5 text-purple-600" />
									<CardTitle className="text-2xl">Create New NFT</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="p-6">
								{isMintEnabled ? (
									<MintNFTForm
										onMint={async (tokenUrl, royalty) => {
											const success = await mintWithRoyalty(tokenUrl, royalty);
											if (success) {
												// Handle success
											}
											return success;
										}}
										loading={loading}
									/>
								) : (
									<div className="text-center py-8">
										<div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
											<SparklesIcon className="h-8 w-8 text-muted-foreground" />
										</div>
										<p className="text-muted-foreground font-medium">
											Minting is currently disabled
										</p>
										<p className="text-sm text-muted-foreground mt-1">
											Check back later to create new NFTs
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Your NFTs Card */}
						<Card className="shadow-lg border-0 overflow-hidden bg-gradient-to-r from-blue-600/20 to-blue-400/10">
							<CardHeader className=" border-b">
								<div className="flex items-center gap-2">
									<GalleryHorizontal className="h-5 w-5 text-blue-600" />
									<CardTitle className="text-2xl">Your Collection</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="p-6">
								<UserNFTs
									account={address as string}
									nfts={userNFTs}
									loading={loading}
									error={error}
								/>
							</CardContent>
						</Card>
					</div>
				) : (
					// Disconnected State
					<div className="max-w-2xl mx-auto text-center py-16">
						<div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6">
							<WalletIcon className="h-12 w-12 text-purple-600" />
						</div>
						<h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
							Connect Your Wallet
						</h2>
						<p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
							Connect your MetaMask wallet to start minting and managing your
							NFT collection
						</p>
						<Button
							onClick={() => connect}
							size="lg"
							className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-3 h-auto text-lg"
						>
							<WalletIcon className="h-5 w-5" />
							Connect MetaMask
						</Button>

						{/* Features Grid */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
							<div className="bg-white p-6 rounded-lg shadow-sm border">
								<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
									<SparklesIcon className="h-6 w-6 text-purple-600" />
								</div>
								<h3 className="font-semibold mb-2">Create NFTs</h3>
								<p className="text-sm text-muted-foreground">
									Mint unique digital assets with custom metadata and royalties
								</p>
							</div>

							<div className="bg-white p-6 rounded-lg shadow-sm border">
								<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
									<GalleryHorizontal className="h-6 w-6 text-blue-600" />
								</div>
								<h3 className="font-semibold mb-2">Manage Collection</h3>
								<p className="text-sm text-muted-foreground">
									View and manage all your NFTs in one convenient place
								</p>
							</div>

							<div className="bg-white p-6 rounded-lg shadow-sm border">
								<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
									<ArrowLeftRightIcon className="h-6 w-6 text-green-600" />
								</div>
								<h3 className="font-semibold mb-2">Earn Royalties</h3>
								<p className="text-sm text-muted-foreground">
									Set royalties to earn from secondary market sales
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
