"use client";

import {
	CheckCircle2,
	Clock,
	Copy,
	Crown,
	Eye,
	Heart,
	Palette,
	ShoppingCart,
	Sparkles,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type NFTMetadata, useCollectibles } from "@/hooks/use-collectibles";

export interface listingMetadatainterface {
	nftData: NFTMetadata | null;
	tokenId: string;
	lister: string;
	nftContract: string;
	price: string;
	isActive: boolean;
	listedTime: string;
	soldAt: string;
}

export default function MarketplaceHomepage() {
	const [activeTab, setActiveTab] = useState("active");
	const [viewModalOpen, setViewModalOpen] = useState(false);
	const [buyModalOpen, setBuyModalOpen] = useState(false);
	const [selectedListing, setSelectedListing] =
		useState<listingMetadatainterface | null>(null);
	const [listings, setListings] = useState<listingMetadatainterface[]>([]);
	const [loadingListings, setLoadingListings] = useState(false);
	const [buyError, setBuyError] = useState("");

	const { address } = useAccount();
	const {
		getAllListings,
		getNFTMetadata,
		buyNFT,
		loading: marketplaceLoading,
	} = useCollectibles(address as string);

	const loadAllListings = useCallback(async () => {
		if (!getAllListings || !getNFTMetadata) return;

		setLoadingListings(true);
		try {
			const allListings = await getAllListings();

			// Fetch NFT metadata for each listing
			const listingsWithMetadata = await Promise.all(
				allListings.map(async (listing) => {
					const nftData = await getNFTMetadata(listing.tokenId);
					return {
						...listing,
						nftData,
					};
				}),
			);

			setListings(listingsWithMetadata);
		} catch (error) {
			console.error("Failed to load listings:", error);
		} finally {
			setLoadingListings(false);
		}
	}, [getAllListings, getNFTMetadata]);

	useEffect(() => {
		loadAllListings();
	}, [loadAllListings]);

	const activeListings = listings.filter((listing) => listing.isActive);
	const endedListings = listings.filter((listing) => !listing.isActive);

	const formatPrice = (priceWei: string) => {
		try {
			const priceEth = parseFloat(priceWei) / 10 ** 18;
			return `${priceEth.toFixed(4)} ETH`;
		} catch {
			return "0 ETH";
		}
	};

	const formatTimeAgo = (timestamp: string) => {
		try {
			const time = parseInt(timestamp) * 1000;
			const now = Date.now();
			const diff = now - time;

			const minutes = Math.floor(diff / 60000);
			const hours = Math.floor(diff / 3600000);
			const days = Math.floor(diff / 86400000);

			if (days > 0) return `${days}d ago`;
			if (hours > 0) return `${hours}h ago`;
			if (minutes > 0) return `${minutes}m ago`;
			return "Just now";
		} catch {
			return "Unknown";
		}
	};

	const handleView = (listing: listingMetadatainterface) => {
		setSelectedListing(listing);
		setViewModalOpen(true);
	};

	const handleBuy = (listing: listingMetadatainterface) => {
		setSelectedListing(listing);
		setBuyModalOpen(true);
		setBuyError("");
	};

	const executeBuy = async () => {
		if (!selectedListing || !buyNFT) return;

		try {
			const result = await buyNFT(
				selectedListing.tokenId,
				selectedListing.nftContract,
				selectedListing.price,
			);

			if (result.success) {
				setBuyModalOpen(false);
				alert("NFT purchased successfully!");
				await loadAllListings(); // Refresh listings
			} else {
				setBuyError(result.error || "Purchase failed");
			}
		} catch {
			setBuyError("Purchase failed");
		}
	};

	const copyTokenURI = (tokenURI: string | null) => {
		navigator.clipboard.writeText(tokenURI || "");
		alert("Token URI copied to clipboard!");
	};

	const ListingCard = ({
		listing,
		isEnded = false,
	}: {
		listing: listingMetadatainterface;
		isEnded?: boolean;
	}) => (
		<Card className="group overflow-hidden border-0 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
			<div className="relative">
				{/* NFT Image */}
				<div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden relative">
					{listing.nftData?.image ? (
						<img
							src={listing.nftData.image}
							alt={listing.nftData?.name || `NFT #${listing.tokenId}`}
							className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-gray-400">
							<div className="text-center">
								<Palette className="h-12 w-12 mx-auto mb-2 text-purple-300" />
								<p className="text-sm">Loading...</p>
							</div>
						</div>
					)}

					{/* Status badges */}
					<div className="absolute top-3 left-3">
						{isEnded ? (
							<Badge className="bg-gray-600 text-white px-2 py-1 rounded-full">
								<CheckCircle2 className="w-3 h-3 mr-1" />
								Sold
							</Badge>
						) : (
							<Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full">
								<Sparkles className="w-3 h-3 mr-1" />
								Available
							</Badge>
						)}
					</div>

					<div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
						<span className="text-white font-bold text-sm">
							{formatPrice(listing.price)}
						</span>
					</div>
				</div>
			</div>

			<CardContent className="p-5">
				<div className="space-y-3">
					{/* NFT Title */}
					<div>
						<h3 className="font-bold text-gray-800 text-lg line-clamp-1 mb-1">
							{listing.nftData?.name || `NFT #${listing.tokenId}`}
						</h3>
						<p className="text-sm text-gray-500 font-medium">
							Token #{listing.tokenId}
						</p>
					</div>

					{/* Listing Info */}
					<div className="flex justify-between items-center text-sm text-gray-600">
						<span className="flex items-center">
							<Clock className="w-4 h-4 mr-1 text-purple-500" />
							{isEnded ? "Sold" : "Listed"} {formatTimeAgo(listing.listedTime)}
						</span>
						<span className="flex items-center">
							<Users className="w-4 h-4 mr-1 text-blue-500" />
							{listing.lister.slice(0, 6)}...
						</span>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-2 pt-3">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleView(listing)}
							className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
						>
							<Eye className="w-4 h-4 mr-1" />
							View
						</Button>

						{!isEnded &&
							listing.lister.toLowerCase() !== address?.toLowerCase() && (
								<Button
									size="sm"
									onClick={() => handleBuy(listing)}
									className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25"
									disabled={marketplaceLoading}
								>
									<ShoppingCart className="w-4 h-4 mr-1" />
									Buy Now
								</Button>
							)}

						{!isEnded &&
							listing.lister.toLowerCase() === address?.toLowerCase() && (
								<Button
									variant="outline"
									size="sm"
									disabled
									className="flex-1 text-gray-500 border-gray-200"
								>
									<Heart className="w-4 h-4 mr-1 text-pink-500" />
									Your Listing
								</Button>
							)}
					</div>
				</div>
			</CardContent>
		</Card>
	);

	const formatDate = (timestamp: string) => {
		try {
			const date = new Date(parseInt(timestamp) * 1000);
			return date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return "Unknown date";
		}
	};

	const LoadingGrid = () => (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
				<Card
					key={i}
					className="overflow-hidden border-0 rounded-2xl shadow-lg"
				>
					<Skeleton className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-200" />
					<CardContent className="p-5 space-y-3">
						<Skeleton className="h-5 w-3/4 bg-gray-200" />
						<Skeleton className="h-4 w-1/2 bg-gray-200" />
						<div className="flex gap-2">
							<Skeleton className="h-8 flex-1 bg-gray-200" />
							<Skeleton className="h-8 flex-1 bg-gray-200" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);

	return (
		<>
			<div className="w-full mx-auto px-4 py-12 -mt-14 relative z-10">
				<div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						<div className="flex justify-center mb-6">
							<TabsList className=" gap-4 w-full max-w-md  rounded-2xl">
								<TabsTrigger
									value="active"
									className="rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-purple-600"
								>
									<Sparkles className="w-4 h-4 mr-2" />
									Active Listings ({activeListings.length})
								</TabsTrigger>
								<TabsTrigger
									value="ended"
									className="rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-purple-600"
								>
									<CheckCircle2 className="w-4 h-4 mr-2" />
									Sold ({endedListings.length})
								</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent value="active">
							{loadingListings ? (
								<LoadingGrid />
							) : activeListings.length > 0 ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
									{activeListings.map((listing) => (
										<ListingCard
											key={`${listing.nftContract}-${listing.tokenId}`}
											listing={listing}
										/>
									))}
								</div>
							) : (
								<div className="text-center py-16">
									<div className="bg-gradient-to-br from-purple-50 to-pink-50 p-12 rounded-3xl shadow-inner max-w-md mx-auto">
										<Palette className="h-20 w-20 text-purple-300 mx-auto mb-6" />
										<h3 className="text-2xl font-bold text-gray-800 mb-3">
											No Active Listings
										</h3>
										<p className="text-gray-600 mb-6">
											Check back soon for new NFT drops!
										</p>
										<Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
											<Zap className="w-4 h-4 mr-2" />
											Refresh
										</Button>
									</div>
								</div>
							)}
						</TabsContent>

						<TabsContent value="ended">
							{loadingListings ? (
								<LoadingGrid />
							) : endedListings.length > 0 ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
									{endedListings.map((listing) => (
										<ListingCard
											key={`${listing.nftContract}-${listing.tokenId}`}
											listing={listing}
											isEnded
										/>
									))}
								</div>
							) : (
								<div className="text-center py-16">
									<div className="bg-gradient-to-br from-purple-50 to-pink-50 p-12 rounded-3xl shadow-inner max-w-md mx-auto">
										<Crown className="h-20 w-20 text-gray-300 mx-auto mb-6" />
										<h3 className="text-2xl font-bold text-gray-800 mb-3">
											No Sales Yet
										</h3>
										<p className="text-gray-600 mb-6">
											Be the first to make a purchase!
										</p>
										<Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
											<TrendingUp className="w-4 h-4 mr-2" />
											Start Shopping
										</Button>
									</div>
								</div>
							)}
						</TabsContent>
					</Tabs>
				</div>
			</div>

			{/* View Modal */}
			<Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl border-0 shadow-2xl">
					<DialogHeader className="border-b border-gray-200 pb-6">
						<DialogTitle className="text-2xl font-bold text-gray-800">
							{selectedListing?.nftData?.name ||
								`NFT #${selectedListing?.tokenId}`}
						</DialogTitle>
						<DialogDescription className="text-gray-600">
							Explore this unique digital collectible
						</DialogDescription>
					</DialogHeader>

					{selectedListing && (
						<div className="space-y-8 py-6">
							{/* Image */}
							<div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden max-w-md mx-auto shadow-lg">
								{selectedListing.nftData?.image ? (
									<img
										src={selectedListing.nftData.image}
										alt={selectedListing.nftData.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<Palette className="h-20 w-20 text-purple-300" />
									</div>
								)}
							</div>

							{/* Description */}
							{selectedListing.nftData?.description && (
								<div className="bg-gray-50 p-6 rounded-xl">
									<h3 className="font-semibold text-gray-800 mb-3 text-lg">
										Description
									</h3>
									<p className="text-gray-600 leading-relaxed">
										{selectedListing.nftData.description}
									</p>
								</div>
							)}

							{/* Details */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm bg-white p-6 rounded-xl border border-gray-200">
								<div className="space-y-4">
									<div>
										<span className="text-gray-500 font-medium">Price:</span>
										<p className="font-bold text-green-600 text-sm">
											{formatPrice(selectedListing.price)}
										</p>
									</div>
									<div>
										<span className="text-gray-500 font-medium">Token ID:</span>
										<p className="font-mono text-gray-800">
											#{selectedListing.tokenId}
										</p>
									</div>
								</div>
								<div className="space-y-4">
									<div>
										<span className="text-gray-500 font-medium">Seller:</span>
										<div className="flex items-center gap-1">
											<p className="font-mono text-sm text-gray-800 break-all">
												{selectedListing.lister}
											</p>
											<Copy
												className="text-green-600"
												size={25}
												onClick={() =>
													navigator.clipboard.writeText(selectedListing.lister)
												}
											/>
										</div>
									</div>
									<div>
										<span className="text-gray-500 font-medium">Status:</span>
										<p
											className={
												selectedListing.isActive
													? "text-green-600 font-semibold"
													: "text-green-600 font-semibold"
											}
										>
											{selectedListing.isActive
												? "Available"
												: `Sold At:${formatDate(selectedListing.soldAt)}`}
										</p>
									</div>
								</div>
								<div>
									<span className="text-gray-500 font-medium">Listed At:</span>
									<p className={"text-green-600 font-semibold"}>
										{formatDate(selectedListing.listedTime)}
									</p>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-4 pt-4">
								{selectedListing.nftData && (
									<Button
										variant="outline"
										onClick={() =>
											copyTokenURI(selectedListing?.nftData?.external_url || "")
										}
										className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
									>
										<Copy className="w-4 h-4 mr-2" />
										Copy URI
									</Button>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Buy Modal */}
			<Dialog open={buyModalOpen} onOpenChange={setBuyModalOpen}>
				<DialogContent className="rounded-2xl border-0 shadow-2xl max-w-md">
					<DialogHeader className="border-b border-gray-200 pb-6">
						<DialogTitle className="text-xl font-bold text-gray-800">
							Purchase NFT #{selectedListing?.tokenId}
						</DialogTitle>
						<DialogDescription>Confirm your purchase details</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						<div className="bg-gray-50 p-6 rounded-xl">
							<div className="flex justify-between items-center mb-3">
								<span className="text-gray-600">Price:</span>
								<span className="font-semibold text-lg">
									{selectedListing && formatPrice(selectedListing.price)}
								</span>
							</div>
							<div className="flex justify-between items-center text-sm text-gray-600 mb-3">
								<span>Platform fee (5%):</span>
								<span>
									{selectedListing &&
										formatPrice(
											(
												(BigInt(selectedListing.price) * BigInt(5)) /
												BigInt(100)
											).toString(),
										)}
								</span>
							</div>
							<hr className="my-4 border-gray-300" />
							<div className="flex justify-between items-center font-bold text-lg">
								<span>Total:</span>
								<span className="text-purple-600">
									{selectedListing &&
										formatPrice(
											(
												(BigInt(selectedListing.price) * BigInt(105)) /
												BigInt(100)
											).toString(),
										)}
								</span>
							</div>
						</div>

						{buyError && (
							<Alert className="border-red-200 bg-red-50">
								<AlertDescription className="text-red-800">
									{buyError}
								</AlertDescription>
							</Alert>
						)}

						<Alert className="bg-blue-50 border-blue-200">
							<AlertDescription className="text-blue-800">
								⚠️ <strong>Confirm your purchase:</strong> This action cannot be
								undone. Make sure you want to buy this NFT.
							</AlertDescription>
						</Alert>

						<div className="flex gap-4">
							<Button
								variant="outline"
								onClick={() => setBuyModalOpen(false)}
								className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
								disabled={marketplaceLoading}
							>
								Cancel
							</Button>
							<Button
								onClick={executeBuy}
								disabled={marketplaceLoading}
								className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
							>
								{marketplaceLoading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Processing...
									</>
								) : (
									<>
										<ShoppingCart className="w-4 h-4 mr-2" />
										Buy Now
									</>
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
