// components/mint-nft-form.tsx
"use client";

import { CrownIcon, FileTextIcon, ImageIcon, InfoIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { pinJSONToIPFS } from "@/hooks/use-upload";

export function MintNFTForm({
	onMint,
	loading,
}: {
	onMint: (tokenUrl: string, royalty: number) => Promise<boolean>;
	loading: boolean;
}) {
	const [imageUrl, setImageUrl] = useState("");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [royaltyAmount, setRoyaltyAmount] = useState(5);
	const [uploadLoading, setUploadLoading] = useState(false);
	const [previewImage, setPreviewImage] = useState("");

	const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const url = e.target.value;
		setImageUrl(url);

		// Simple URL validation for preview
		try {
			new URL(url);
			setPreviewImage(url);
		} catch {
			setPreviewImage("");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			imageUrl.trim() === "" ||
			name.trim() === "" ||
			description.trim() === ""
		) {
			alert("❗Please make sure all fields are completed before minting.");
			return;
		}

		if (royaltyAmount > 10) {
			alert("Royalty cannot exceed 10%");
			return;
		}

		setUploadLoading(true);

		try {
			const metadata = {
				name: name.trim(),
				image: imageUrl.trim(),
				description: description.trim(),
				attributes: [],
			};

			const pinataResponse = await pinJSONToIPFS(metadata);

			if (!pinataResponse.success) {
				alert("😢 Something went wrong while uploading your tokenURI.");
				setUploadLoading(false);
				return;
			}

			const tokenURI = pinataResponse.pinataUrl;
			await onMint(tokenURI || "", royaltyAmount * 100);
		} catch (error) {
			console.error("Error uploading to IPFS:", error);
			alert("😢 Something went wrong while uploading your tokenURI.");
		} finally {
			setUploadLoading(false);
		}
	};

	const isMinting = loading || uploadLoading;

	return (
		<Card className="w-full max-w-2xl mx-auto shadow-lg">
			<CardHeader className="pb-4">
				<CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
					<ImageIcon className="h-6 w-6" />
					Create Your NFT
				</CardTitle>
				<CardDescription className="text-center">
					Mint a unique NFT with customizable metadata and royalty settings
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Left column - Form inputs */}
						<div className="space-y-5">
							<div className="space-y-2">
								<Label htmlFor="name" className="flex items-center gap-1">
									<FileTextIcon className="h-4 w-4" />
									NFT Name
								</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="My Awesome NFT"
									className="transition-all focus-visible:ring-2 focus-visible:ring-purple-500"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="imageUrl" className="flex items-center gap-1">
									<ImageIcon className="h-4 w-4" />
									Image URL
								</Label>
								<Input
									id="imageUrl"
									value={imageUrl}
									onChange={handleImageUrlChange}
									placeholder="https://example.com/image.png"
									className="transition-all focus-visible:ring-2 focus-visible:ring-purple-500"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Describe your NFT..."
									rows={3}
									className="resize-none transition-all focus-visible:ring-2 focus-visible:ring-purple-500"
									required
								/>
							</div>

							<div className="space-y-3 pt-2">
								<Label htmlFor="royalty" className="flex items-center gap-1">
									<CrownIcon className="h-4 w-4" />
									Royalty Percentage: {royaltyAmount}%
								</Label>
								<div className="flex items-center gap-3">
									<Slider
										id="royalty"
										min={0}
										max={10}
										step={0.5}
										value={[royaltyAmount]}
										onValueChange={([value]) => setRoyaltyAmount(value)}
										className="flex-1"
									/>
									<Input
										type="number"
										min="0"
										max="10"
										value={royaltyAmount}
										onChange={(e) => setRoyaltyAmount(Number(e.target.value))}
										className="w-20"
										required
									/>
								</div>
								<p className="text-xs text-muted-foreground flex items-center gap-1">
									<InfoIcon className="h-3 w-3" />
									Maximum royalty is 10%
								</p>
							</div>
						</div>

						{/* Right column - Image preview */}
						<div className="space-y-4">
							<Label>Image Preview</Label>
							<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg h-60 flex items-center justify-center overflow-hidden">
								{previewImage ? (
									<img
										src={previewImage}
										alt="NFT preview"
										className="object-cover w-full h-full"
										onError={(e) => {
											e.currentTarget.src =
												"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='10px' fill='%23999'%3EInvalid Image URL%3C/text%3E%3C/svg%3E";
										}}
									/>
								) : (
									<div className="text-center p-4 text-muted-foreground">
										<ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
										<p className="text-sm">Enter an image URL to see preview</p>
									</div>
								)}
							</div>

							<div className="rounded-lg bg-muted p-4">
								<h4 className="font-medium text-sm flex items-center gap-1 mb-2">
									<InfoIcon className="h-4 w-4" />
									Minting Details
								</h4>
								<ul className="text-xs space-y-1 text-muted-foreground">
									<li>• Minting fee: 0.0005 ETH</li>
									<li>• Metadata stored on IPFS via Pinata</li>
									<li>• Royalty: {royaltyAmount}% on secondary sales</li>
									<li>• NFT will be minted to your connected wallet</li>
								</ul>
							</div>
						</div>
					</div>

					<Button
						type="submit"
						disabled={isMinting}
						className="w-full py-3 font-medium transition-all bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
						size="lg"
					>
						{isMinting ? (
							<>
								<span className="animate-pulse">⏳</span> Uploading & Minting...
							</>
						) : (
							"Mint NFT (0.0005 ETH)"
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
