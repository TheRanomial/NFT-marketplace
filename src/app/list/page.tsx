"use client";
import { Copy, Edit, ExternalLink, Eye, Tag } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
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
import {
	COLLECTIBLES_ADDRESS,
	type NFTData,
	useCollectibles,
} from "@/hooks/use-collectibles";

interface Listing {
	tokenId: string;
	lister: string;
	nftContract: string;
	price: string;
	isActive: boolean;
	listedTime: string;
	soldAt: string;
}

export default function NFTMarketplaceManager() {
	const [viewModalOpen, setViewModalOpen] = useState(false);
	const [listModalOpen, setListModalOpen] = useState(false);
	const [updateModalOpen, setUpdateModalOpen] = useState(false);
	const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null);
	const [listPrice, setListPrice] = useState("");
	const [updatePrice, setUpdatePrice] = useState("");
	const [listError, setListError] = useState("");
	const [updateError, setUpdateError] = useState("");
	const [listings, setListings] = useState<Record<string, Listing>>({});
	const [loadingListings, setLoadingListings] = useState(false);

	const { address } = useAccount();
	const {
		userNFTs: nfts,
		listNFT,
		delistNFT,
		updateListingPrice,
		getUserListings,
		loading: marketplaceLoading,
	} = useCollectibles(address as string);

	const loadUserListings = useCallback(async () => {
		if (!getUserListings) return;

		setLoadingListings(true);
		try {
			const userListings = await getUserListings();
			const listingsMap: Record<string, Listing> = {};
			console.log(userListings);

			userListings.forEach((listing: Listing) => {
				const key = `${listing.nftContract}-${listing.tokenId}`;
				listingsMap[key] = listing;
			});

			setListings(listingsMap);
		} catch (error) {
			console.error("Failed to load listings:", error);
		} finally {
			setLoadingListings(false);
		}
	}, [getUserListings]);

	useEffect(() => {
		if (address) {
			loadUserListings();
		}
	}, [address, loadUserListings]);

	const handleView = (nft: NFTData) => {
		setSelectedNFT(nft);
		setViewModalOpen(true);
	};

	const handleList = (nft: NFTData) => {
		setSelectedNFT(nft);
		setListModalOpen(true);
		setListPrice("");
		setListError("");
	};

	const handleUpdateListing = (nft: NFTData) => {
		setSelectedNFT(nft);
		const listing = isNFTListed(nft);
		if (listing) {
			// Pre-fill with current price in ETH
			const currentPriceEth = (parseFloat(listing.price) / 10 ** 18).toString();
			setUpdatePrice(currentPriceEth);
		}
		setUpdateModalOpen(true);
		setUpdateError("");
	};

	const executeList = async () => {
		if (!listPrice.trim()) {
			setListError("Please enter a listing price");
			return;
		}

		const priceNum = parseFloat(listPrice);
		if (Number.isNaN(priceNum) || priceNum <= 0) {
			setListError("Please enter a valid price greater than 0");
			return;
		}

		if (!selectedNFT || !listNFT) return;

		try {
			const result = await listNFT(
				selectedNFT.tokenId,
				COLLECTIBLES_ADDRESS,
				listPrice,
			);

			if (result.success) {
				setListModalOpen(false);
				alert("NFT listed successfully!");
				await loadUserListings();
			} else {
				setListError(result.error || "Listing failed");
			}
		} catch {
			setListError("Listing failed");
		}
	};

	const executeUpdateListing = async () => {
		if (!updatePrice.trim()) {
			setUpdateError("Please enter a new listing price");
			return;
		}

		const priceNum = parseFloat(updatePrice);
		if (Number.isNaN(priceNum) || priceNum <= 0) {
			setUpdateError("Please enter a valid price greater than 0");
			return;
		}

		if (!selectedNFT || !updateListingPrice) return;

		try {
			const result = await updateListingPrice(
				selectedNFT.tokenId,
				COLLECTIBLES_ADDRESS,
				updatePrice,
			);

			if (result.success) {
				setUpdateModalOpen(false);
				alert("Listing price updated successfully!");
				await loadUserListings();
			} else {
				setUpdateError(result.error || "Update failed");
			}
		} catch {
			setUpdateError("Update failed");
		}
	};

	const handleDelist = async (nft: NFTData) => {
		if (!delistNFT) return;

		try {
			const result = await delistNFT(nft.tokenId, COLLECTIBLES_ADDRESS);

			if (result.success) {
				alert("NFT delisted successfully!");
				await loadUserListings();
			} else {
				alert(result.error || "Delisting failed");
			}
		} catch {
			alert("Delisting failed");
		}
	};

	const openInOpenSea = (nft: NFTData) => {
		const contractAddress =
			nft.contract || "0xeD206F25fB9C73cbB61A15916E02F772B8404C14";
		const url = `https://opensea.io/assets/ethereum/${contractAddress}/${nft.tokenId}`;
		window.open(url, "_blank");
	};

	const copyTokenURI = (tokenURI: string) => {
		navigator.clipboard.writeText(tokenURI);
		alert("Token URI copied to clipboard!");
	};

	const formatPrice = (priceWei: string) => {
		try {
			const priceEth = parseFloat(priceWei) / 10 ** 18;
			return `${priceEth.toFixed(4)} ETH`;
		} catch {
			return "0 ETH";
		}
	};

	const formatRoyalty = (royaltyWei?: string) => {
		if (!royaltyWei) return "0%";
		const royaltyEth = parseFloat(royaltyWei) / 10 ** 18;
		const percentage = (royaltyEth / 1) * 100;
		return `${percentage.toFixed(2)}%`;
	};

	const isNFTListed = (nft: NFTData): Listing | null => {
		const key = `${nft.contract || "0xeD206F25fB9C73cbB61A15916E02F772B8404C14"}-${nft.tokenId}`;
		const listing = listings[key];
		return listing?.isActive ? listing : null;
	};

	if (!nfts || nfts.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="bg-white p-8 rounded-xl shadow-md max-w-md mx-auto">
					<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<Tag className="h-8 w-8 text-purple-600" />
					</div>
					<h3 className="text-xl font-semibold text-gray-800 mb-2">
						No NFTs Yet
					</h3>
					<p className="text-gray-600">You don&apos;t own any NFTs yet</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
				<h2 className="text-3xl font-bold text-gray-800 mb-2">
					Manage Your NFT Collection
				</h2>
				<p className="text-gray-600">
					List your NFTs for sale or manage existing listings on the marketplace
				</p>
			</div>

			{loadingListings && (
				<div className="mb-6">
					<Alert className="bg-purple-50 border-purple-200">
						<AlertDescription className="text-purple-800">
							Loading marketplace listings...
						</AlertDescription>
					</Alert>
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{nfts.map((nft) => {
					const listing = isNFTListed(nft);
					const isListed = !!listing;

					return (
						<Card
							key={nft.tokenId.toString()}
							className="relative overflow-hidden border-0 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
						>
							{isListed && (
								<div className="absolute top-3 right-3 z-10">
									<Badge className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-2 py-1 rounded-full text-xs font-medium">
										Listed
									</Badge>
								</div>
							)}

							<CardHeader className="pb-3">
								<CardTitle className="text-lg font-semibold text-gray-800 line-clamp-1 pr-16">
									{nft.metadata?.name || `NFT #${nft.tokenId.toString()}`}
								</CardTitle>
							</CardHeader>

							<CardContent className="pt-0">
								{/* NFT Image */}
								<div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg mb-4 overflow-hidden group relative">
									{nft.metadata?.image ? (
										<img
											src={nft.metadata.image}
											alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
											className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center text-gray-400">
											<div className="text-center">
												<div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-2">
													<Tag className="h-6 w-6 text-purple-600" />
												</div>
												<p className="text-sm">No Image</p>
											</div>
										</div>
									)}
								</div>

								{/* Quick Info */}
								<div className="space-y-3 mb-5">
									<div className="flex justify-between items-center text-sm">
										<span className="text-gray-600">Token ID:</span>
										<Badge
											variant="outline"
											className="bg-gray-100 text-gray-700 font-mono"
										>
											#{nft.tokenId}
										</Badge>
									</div>
									{listing && (
										<div className="flex justify-between items-center text-sm">
											<span className="text-gray-600">Price:</span>
											<span className="text-green-600 font-semibold">
												{formatPrice(listing.price)}
											</span>
										</div>
									)}
									{nft.royaltyAmount && (
										<div className="flex justify-between items-center text-sm">
											<span className="text-gray-600">Royalty:</span>
											<span className="text-purple-600 font-medium">
												{formatRoyalty(nft.royaltyAmount)}
											</span>
										</div>
									)}
								</div>

								{/* Action Buttons */}
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleView(nft)}
										className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
									>
										<Eye className="w-3.5 h-3.5 mr-1.5" />
										View
									</Button>

									{isListed ? (
										<>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleUpdateListing(nft)}
												className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
												disabled={marketplaceLoading}
											>
												<Edit className="w-3.5 h-3.5 mr-1.5" />
												Update
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDelist(nft)}
												className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
												disabled={marketplaceLoading}
											>
												<Tag className="w-3.5 h-3.5 mr-1.5" />
												Delist
											</Button>
										</>
									) : (
										<Button
											size="sm"
											onClick={() => handleList(nft)}
											className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
											disabled={marketplaceLoading}
										>
											<Tag className="w-3.5 h-3.5 mr-1.5" />
											List
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* View Modal */}
			<Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border-0 bg-white shadow-xl">
					<DialogHeader className="border-b border-gray-200 pb-4">
						<DialogTitle className="text-xl font-bold text-gray-800">
							{selectedNFT?.metadata?.name || `NFT #${selectedNFT?.tokenId}`}
						</DialogTitle>
					</DialogHeader>

					{selectedNFT && (
						<div className="space-y-6 py-4">
							{/* Image */}
							<div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl overflow-hidden max-w-md mx-auto shadow-md">
								{selectedNFT.metadata?.image ? (
									<img
										src={selectedNFT.metadata.image}
										alt={selectedNFT.metadata?.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-gray-400">
										<div className="text-center">
											<div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
												<Tag className="h-8 w-8 text-purple-600" />
											</div>
											<p className="text-gray-500">No Image Available</p>
										</div>
									</div>
								)}
							</div>

							{/* Description */}
							{selectedNFT.metadata?.description && (
								<div className="bg-gray-50 p-4 rounded-lg">
									<h3 className="font-semibold text-gray-800 mb-2">
										Description
									</h3>
									<p className="text-gray-600">
										{selectedNFT.metadata.description}
									</p>
								</div>
							)}

							<div className="bg-white border border-gray-200 rounded-lg p-4">
								<h3 className="font-semibold text-gray-800 mb-3">
									Token Details
								</h3>
								<div className="space-y-3 text-sm">
									<div className="flex justify-between items-center py-2 border-b border-gray-100">
										<span className="text-gray-600">Token ID:</span>
										<span className="font-mono text-gray-800">
											#{selectedNFT.tokenId}
										</span>
									</div>
									{selectedNFT.royaltyAmount && (
										<div className="flex justify-between items-center py-2 border-b border-gray-100">
											<span className="text-gray-600">Royalty:</span>
											<span className="text-purple-600 font-medium">
												{formatRoyalty(selectedNFT.royaltyAmount)}
											</span>
										</div>
									)}
									{selectedNFT.royaltyRecipient && (
										<div className="flex justify-between items-center py-2 border-b border-gray-100">
											<span className="text-gray-600">Creator:</span>
											<span className="font-mono text-xs text-gray-700">
												{selectedNFT.royaltyRecipient.slice(0, 6)}...
												{selectedNFT.royaltyRecipient.slice(-4)}
											</span>
										</div>
									)}

									{/* Show listing status */}
									{(() => {
										const listing = isNFTListed(selectedNFT);
										return (
											listing && (
												<div className="flex justify-between items-center py-2 border-b border-gray-100">
													<span className="text-gray-600">Listed Price:</span>
													<span className="text-green-600 font-semibold">
														{formatPrice(listing.price)}
													</span>
												</div>
											)
										);
									})()}
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3 pt-4 border-t border-gray-200">
								<Button
									onClick={() => openInOpenSea(selectedNFT)}
									className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
								>
									<ExternalLink className="w-4 h-4 mr-2" />
									View on OpenSea
								</Button>
								<Button
									variant="outline"
									onClick={() => copyTokenURI(selectedNFT.tokenURI)}
									className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
								>
									<Copy className="w-4 h-4 mr-2" />
									Copy Metadata URI
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* List Modal */}
			<Dialog open={listModalOpen} onOpenChange={setListModalOpen}>
				<DialogContent className="rounded-xl border-0 bg-white shadow-xl">
					<DialogHeader className="border-b border-gray-200 pb-4">
						<DialogTitle className="text-xl font-bold text-gray-800">
							List NFT #{selectedNFT?.tokenId} for Sale
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="price" className="text-gray-700 font-medium">
								Price (ETH)
							</Label>
							<Input
								id="price"
								type="number"
								step="0.001"
								min="0"
								placeholder="0.1"
								value={listPrice}
								onChange={(e) => setListPrice(e.target.value)}
								className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
							/>
							{listError && <p className="text-red-500 text-sm">{listError}</p>}
						</div>

						<Alert className="bg-purple-50 border-purple-200">
							<AlertDescription className="text-purple-800">
								📝 <strong>Note:</strong> You need to approve the marketplace
								contract to manage your NFTs before listing. A 5% platform fee
								will be charged on sales.
							</AlertDescription>
						</Alert>

						<div className="flex gap-3 pt-4">
							<Button
								variant="outline"
								onClick={() => setListModalOpen(false)}
								className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
								disabled={marketplaceLoading}
							>
								Cancel
							</Button>
							<Button
								onClick={executeList}
								disabled={marketplaceLoading || !listPrice.trim()}
								className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
							>
								{marketplaceLoading ? "Listing..." : "List NFT"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Update Listing Modal */}
			<Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
				<DialogContent className="rounded-xl border-0 bg-white shadow-xl">
					<DialogHeader className="border-b border-gray-200 pb-4">
						<DialogTitle className="text-xl font-bold text-gray-800">
							Update Listing Price for NFT #{selectedNFT?.tokenId}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label
								htmlFor="updatePrice"
								className="text-gray-700 font-medium"
							>
								New Price (ETH)
							</Label>
							<Input
								id="updatePrice"
								type="number"
								step="0.001"
								min="0"
								placeholder="0.1"
								value={updatePrice}
								onChange={(e) => setUpdatePrice(e.target.value)}
								className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
							/>
							{updateError && (
								<p className="text-red-500 text-sm">{updateError}</p>
							)}
						</div>

						<Alert className="bg-blue-50 border-blue-200">
							<AlertDescription className="text-blue-800">
								✏️ <strong>Update Listing:</strong> This will change your
								NFT&apos;s listing price. The marketplace fee (5%) will apply to
								the new price when sold.
							</AlertDescription>
						</Alert>

						<div className="flex gap-3 pt-4">
							<Button
								variant="outline"
								onClick={() => setUpdateModalOpen(false)}
								className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
								disabled={marketplaceLoading}
							>
								Cancel
							</Button>
							<Button
								onClick={executeUpdateListing}
								disabled={marketplaceLoading || !updatePrice.trim()}
								className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
							>
								{marketplaceLoading ? "Updating..." : "Update Price"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
