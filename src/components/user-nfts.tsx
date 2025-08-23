"use client";

import { Copy, ExternalLink, Eye, Send } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { type NFTData, useCollectibles } from "@/hooks/use-collectibles";

export function UserNFTs({
	nfts,
	loading,
	error,
	account,
}: {
	nfts: NFTData[];
	loading: boolean;
	error: string | null;
	account: string | null;
}) {
	const [viewModalOpen, setViewModalOpen] = useState(false);
	const [transferModalOpen, setTransferModalOpen] = useState(false);
	const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null);
	const [transferAddress, setTransferAddress] = useState("");
	const [transferError, setTransferError] = useState("");

	const { transferNFT, loading: transferLoading } = useCollectibles(account);

	const handleView = (nft: NFTData) => {
		setSelectedNFT(nft);
		setViewModalOpen(true);
	};

	const handleTransfer = (nft: NFTData) => {
		setSelectedNFT(nft);
		setTransferModalOpen(true);
		setTransferAddress("");
		setTransferError("");
	};

	const executeTransfer = async () => {
		if (!transferAddress.trim()) {
			setTransferError("Please enter a recipient address");
			return;
		}

		if (!/^0x[a-fA-F0-9]{40}$/.test(transferAddress)) {
			setTransferError("Please enter a valid Ethereum address");
			return;
		}

		if (!selectedNFT) return;

		try {
			const result = await transferNFT(selectedNFT.tokenId, transferAddress);
			if (result.success) {
				setTransferModalOpen(false);
				alert("NFT transferred successfully!");
			} else {
				setTransferError(result.error || "Transfer failed");
			}
		} catch {
			setTransferError("Transfer failed");
		}
	};

	const openInOpenSea = (nft: NFTData) => {
		const contractAddress = "0xeD206F25fB9C73cbB61A15916E02F772B8404C14";
		const url = `https://opensea.io/assets/ethereum/${contractAddress}/${nft.tokenId}`;
		window.open(url, "_blank");
	};

	const copyTokenURI = (tokenURI: string) => {
		navigator.clipboard.writeText(tokenURI);
		alert("Token URI copied to clipboard!");
	};

	const formatRoyalty = (royaltyWei?: string) => {
		if (!royaltyWei) return "0%";
		const royaltyEth = parseFloat(royaltyWei) / 10 ** 18;
		const percentage = (royaltyEth / 1) * 100;
		return `${percentage.toFixed(2)}%`;
	};

	if (loading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-[200px]" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-6 w-[100px]" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-[200px] w-full mb-4" />
								<div className="flex gap-2">
									<Skeleton className="h-8 w-[60px]" />
									<Skeleton className="h-8 w-[80px]" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return <p className="text-red-500">{error}</p>;
	}

	if (!nfts || nfts.length === 0) {
		return (
			<p className="text-muted-foreground">You don&apos;t own any NFTs yet</p>
		);
	}

	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{nfts.map((nft) => (
					<Card key={nft.tokenId.toString()}>
						<CardHeader>
							<CardTitle>
								{nft.metadata?.name || `NFT #${nft.tokenId.toString()}`}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{/* NFT Image */}
							<div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
								{nft.metadata?.image ? (
									<img
										src={nft.metadata.image}
										alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-muted-foreground">
										No Image
									</div>
								)}
							</div>

							{/* Quick Info */}
							<div className="space-y-2 mb-4">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Token ID:</span>
									<Badge variant="secondary">#{nft.tokenId}</Badge>
								</div>
								{nft.royaltyAmount && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Royalty:</span>
										<span className="text-purple-600 font-medium">
											{formatRoyalty(nft.royaltyAmount)}
										</span>
									</div>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex flex-col gap-1">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleView(nft)}
									className="flex-1"
								>
									<Eye className="w-3 h-3 mr-1" />
									View
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleTransfer(nft)}
									className="flex-1"
								>
									<Send className="w-3 h-3" />
									Transfer
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* View Modal */}
			<Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{selectedNFT?.metadata?.name || `NFT #${selectedNFT?.tokenId}`}
						</DialogTitle>
					</DialogHeader>

					{selectedNFT && (
						<div className="space-y-6">
							{/* Image */}
							<div className="aspect-square bg-muted rounded-lg overflow-hidden max-w-md mx-auto">
								{selectedNFT.metadata?.image ? (
									<img
										src={selectedNFT.metadata.image}
										alt={selectedNFT.metadata?.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-muted-foreground">
										No Image Available
									</div>
								)}
							</div>

							{/* Description */}
							{selectedNFT.metadata?.description && (
								<div>
									<h3 className="font-semibold mb-2">Description</h3>
									<p className="text-muted-foreground">
										{selectedNFT.metadata.description}
									</p>
								</div>
							)}

							<div>
								<h3 className="font-semibold mb-3">Token Details</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">Token ID:</span>
										<span className="font-mono">#{selectedNFT.tokenId}</span>
									</div>
									{selectedNFT.royaltyAmount && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">Royalty:</span>
											<span className="text-purple-600">
												{formatRoyalty(selectedNFT.royaltyAmount)}
											</span>
										</div>
									)}
									{selectedNFT.royaltyRecipient && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">Creator:</span>
											<span className="font-mono text-xs">
												{selectedNFT.royaltyRecipient.slice(0, 6)}...
												{selectedNFT.royaltyRecipient.slice(-4)}
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3 pt-4 border-t">
								<Button
									onClick={() => openInOpenSea(selectedNFT)}
									className="flex-1"
								>
									<ExternalLink className="w-4 h-4 mr-2" />
									View on OpenSea
								</Button>
								<Button
									variant="outline"
									onClick={() => copyTokenURI(selectedNFT.tokenURI)}
									className="flex-1"
								>
									<Copy className="w-4 h-4 mr-2" />
									Copy Metadata URI
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Transfer Modal */}
			<Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Transfer NFT #{selectedNFT?.tokenId}</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="recipient">Recipient Address</Label>
							<Input
								id="recipient"
								placeholder="0x..."
								value={transferAddress}
								onChange={(e) => setTransferAddress(e.target.value)}
							/>
							{transferError && (
								<p className="text-red-500 text-sm">{transferError}</p>
							)}
						</div>

						<Alert>
							<AlertDescription>
								⚠️ <strong>Warning:</strong> This action cannot be undone. Make
								sure the recipient address is correct.
							</AlertDescription>
						</Alert>

						<div className="flex gap-3 pt-4">
							<Button
								variant="outline"
								onClick={() => setTransferModalOpen(false)}
								className="flex-1"
								disabled={transferLoading}
							>
								Cancel
							</Button>
							<Button
								onClick={executeTransfer}
								disabled={transferLoading || !transferAddress.trim()}
								className="flex-1"
							>
								{transferLoading ? "Transferring..." : "Transfer NFT"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
