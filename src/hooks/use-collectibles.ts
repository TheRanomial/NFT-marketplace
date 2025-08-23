import { ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { CollectiblesABI } from "@/lib/abi";
import { MARKETPLACE_ABI } from "@/lib/marketplace-abi";

export const COLLECTIBLES_ADDRESS =
	"0xeD206F25fB9C73cbB61A15916E02F772B8404C14";
export const MARKETPLACE_ADDRESS = "0x6CEEDD9C0Ba0933932258511F07e5129e37Bea65";

export interface NFTAttribute {
	trait_type: string;
	value: string | number;
	display_type?: string;
}

export interface NFTMetadata {
	name?: string;
	description?: string;
	image?: string;
	external_url?: string;
	animation_url?: string;
	attributes?: NFTAttribute[];
	background_color?: string;
	[key: string]: unknown;
}

export interface NFTData {
	tokenId: string;
	tokenURI: string;
	metadata?: NFTMetadata | null;
	royaltyAmount?: string;
	royaltyRecipient?: string;
	contract?: string; // Add contract address for marketplace
}

export interface TransferResult {
	success: boolean;
	transactionHash?: string;
	receipt?: ethers.TransactionReceipt;
	error?: string;
}

export interface ContractListing {
	tokenId: bigint;
	lister: string;
	nftContract: string;
	price: bigint;
	isActive: boolean;
	listedTime: bigint;
	soldAt: bigint;
}

export interface Listing {
	tokenId: string;
	lister: string;
	nftContract: string;
	price: string;
	isActive: boolean;
	listedTime: string;
	soldAt: string;
}

export interface MarketplaceResult {
	success: boolean;
	transactionHash?: string;
	error?: string;
}

export function useCollectibles(account: string | null) {
	const [isMintEnabled, setIsMintEnabled] = useState<boolean>(false);
	const [userNFTs, setUserNFTs] = useState<NFTData[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const getContract = useCallback(async (needsSigner = true) => {
		if (typeof window.ethereum === "undefined") {
			throw new Error("MetaMask is not installed");
		}
		const provider = new ethers.BrowserProvider(window.ethereum);

		if (needsSigner) {
			const signer = await provider.getSigner();
			return new ethers.Contract(COLLECTIBLES_ADDRESS, CollectiblesABI, signer);
		} else {
			return new ethers.Contract(
				COLLECTIBLES_ADDRESS,
				CollectiblesABI,
				provider,
			);
		}
	}, []);

	const getMarketplaceContract = useCallback(async (needsSigner = true) => {
		if (typeof window.ethereum === "undefined") {
			throw new Error("MetaMask is not installed");
		}
		const provider = new ethers.BrowserProvider(window.ethereum);

		if (needsSigner) {
			const signer = await provider.getSigner();
			return new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
		} else {
			return new ethers.Contract(
				MARKETPLACE_ADDRESS,
				MARKETPLACE_ABI,
				provider,
			);
		}
	}, []);

	const getNFTContract = useCallback(
		async (contractAddress: string, needsSigner = true) => {
			if (typeof window.ethereum === "undefined") {
				throw new Error("MetaMask is not installed");
			}
			const provider = new ethers.BrowserProvider(window.ethereum);

			if (needsSigner) {
				const signer = await provider.getSigner();
				return new ethers.Contract(contractAddress, CollectiblesABI, signer);
			} else {
				return new ethers.Contract(contractAddress, CollectiblesABI, provider);
			}
		},
		[],
	);

	const checkMintStatus = useCallback(async () => {
		try {
			const contract = await getContract(false); // Read-only
			const status = await contract.isPublicMintEnabled();
			setIsMintEnabled(status);
		} catch (err) {
			setError("Failed to check mint status");
			console.error(err);
		}
	}, [getContract]);

	const fetchMetadata = useCallback(
		async (tokenURI: string): Promise<NFTMetadata | null> => {
			try {
				let url = tokenURI;
				if (tokenURI.startsWith("ipfs://")) {
					url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
				}

				const response = await fetch(url);
				if (response.ok) {
					const metadata = (await response.json()) as NFTMetadata;
					return metadata;
				}
			} catch (error) {
				console.error("Failed to fetch metadata:", error);
			}
			return null;
		},
		[],
	);

	const getUserNFTs = useCallback(async () => {
		if (!account) {
			setUserNFTs([]);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const contract = await getContract();
			const balance = await contract.balanceOf(account);
			const nftCount = Number(balance);

			console.log("nftCount", nftCount);

			if (nftCount === 0) {
				setUserNFTs([]);
				return;
			}

			const nftPromises = [];
			for (let i = 0; i < nftCount; i++) {
				nftPromises.push(contract.tokenOfOwnerByIndex(account, i));
			}

			const tokenIds = await Promise.all(nftPromises);
			console.log("tokenId", tokenIds);

			const nftDataPromises = tokenIds.map(
				async (tokenId): Promise<NFTData> => {
					try {
						const [tokenURI, royaltyInfo] = await Promise.all([
							contract.tokenURI(tokenId),
							contract.royaltyInfo(tokenId, ethers.parseEther("1")),
						]);

						console.log(tokenURI, royaltyInfo);
						const metadata = await fetchMetadata(tokenURI);

						return {
							tokenId: tokenId.toString(),
							tokenURI,
							metadata,
							royaltyAmount: royaltyInfo[1].toString(),
							royaltyRecipient: royaltyInfo[0],
							contract: COLLECTIBLES_ADDRESS, // Add contract address
						};
					} catch (error) {
						console.error(`Error fetching data for token ${tokenId}:`, error);
						return {
							tokenId: tokenId.toString(),
							tokenURI: "",
							metadata: null,
							royaltyAmount: "0",
							royaltyRecipient: "",
							contract: COLLECTIBLES_ADDRESS,
						};
					}
				},
			);

			const nftData = await Promise.all(nftDataPromises);
			setUserNFTs(nftData);
		} catch (err) {
			setError("Failed to fetch user NFTs");
			console.error(err);
		} finally {
			setLoading(false);
		}
	}, [account, getContract, fetchMetadata]);

	const mintWithRoyalty = useCallback(
		async (tokenUrl: string, royaltyAmount: number): Promise<boolean> => {
			try {
				setLoading(true);
				setError(null);

				const contract = await getContract(true);

				const tx = await contract.mintWithRoyalty(tokenUrl, royaltyAmount, {
					value: ethers.parseEther("0.0005"),
				});

				await tx.wait();
				await getUserNFTs();

				return true;
			} catch (err) {
				const error = err as Error;
				setError(error.message || "Minting failed");
				console.error(err);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[getContract, getUserNFTs],
	);

	const getTotalSupply = useCallback(async (): Promise<number> => {
		try {
			const contract = await getContract(false);
			const totalSupply = await contract.totalSupply();
			return Number(totalSupply);
		} catch (err) {
			console.error("Failed to get total supply:", err);
			return 0;
		}
	}, [getContract]);

	const getTokenOwner = useCallback(
		async (tokenId: string): Promise<string | null> => {
			try {
				const contract = await getContract(false);
				return await contract.ownerOf(tokenId);
			} catch (err) {
				console.error(`Failed to get owner of token ${tokenId}:`, err);
				return null;
			}
		},
		[getContract],
	);

	const transferNFT = useCallback(
		async (tokenId: string, toAddress: string): Promise<TransferResult> => {
			try {
				setLoading(true);
				setError(null);

				const contract = await getContract(true);

				if (!account) {
					throw new Error("No account connected");
				}

				const tx = await contract.transferFrom(account, toAddress, tokenId);

				const receipt = await tx.wait();

				await getUserNFTs();

				return {
					success: true,
					transactionHash: tx.hash,
					receipt,
				};
			} catch (err) {
				const error = err as Error;
				const errorMessage = error.message || "Transfer failed";
				setError(errorMessage);
				console.error("Transfer error:", err);

				return {
					success: false,
					error: errorMessage,
				};
			} finally {
				setLoading(false);
			}
		},
		[account, getContract, getUserNFTs],
	);

	const safeTransferNFT = useCallback(
		async (
			tokenId: string,
			toAddress: string,
			data: string = "0x",
		): Promise<TransferResult> => {
			try {
				setLoading(true);
				setError(null);

				const contract = await getContract(true);

				if (!account) {
					throw new Error("No account connected");
				}

				const tx = await contract[
					"safeTransferFrom(address,address,uint256,bytes)"
				](account, toAddress, tokenId, data);

				const receipt = await tx.wait();
				await getUserNFTs();

				return {
					success: true,
					transactionHash: tx.hash,
					receipt,
				};
			} catch (err) {
				const errorMessage = "Safe transfer failed";
				setError(errorMessage);
				console.error("Safe transfer error:", err);

				return {
					success: false,
					error: errorMessage,
				};
			} finally {
				setLoading(false);
			}
		},
		[account, getContract, getUserNFTs],
	);

	// MARKETPLACE FUNCTIONS

	const listNFT = useCallback(
		async (
			tokenId: string,
			nftContract: string,
			price: string,
		): Promise<MarketplaceResult> => {
			try {
				if (!account) {
					return { success: false, error: "Please connect your wallet" };
				}

				setLoading(true);
				setError(null);

				// Get contracts
				const marketplaceContract = await getMarketplaceContract(true);
				const nftContractInstance = await getNFTContract(nftContract, true);

				// Convert price from ETH to Wei
				const priceInWei = ethers.parseEther(price);

				// Check if marketplace is approved
				const isApprovedForAll = await nftContractInstance.isApprovedForAll(
					account,
					MARKETPLACE_ADDRESS,
				);

				const approvedAddress = await nftContractInstance.getApproved(tokenId);
				const isTokenApproved = approvedAddress === MARKETPLACE_ADDRESS;

				if (!isApprovedForAll && !isTokenApproved) {
					// Need to approve marketplace
					const approveTx = await nftContractInstance.setApprovalForAll(
						MARKETPLACE_ADDRESS,
						true,
					);
					await approveTx.wait();
				}

				// Now list the NFT
				const tx = await marketplaceContract.listItem(
					tokenId,
					nftContract,
					priceInWei,
				);

				const receipt = await tx.wait();

				return {
					success: true,
					transactionHash: receipt.hash,
				};
			} catch (err) {
				console.error("Error listing NFT:", err);
				const errorMessage = "Failed to list NFT";
				setError(errorMessage);
				return {
					success: false,
					error: errorMessage,
				};
			} finally {
				setLoading(false);
			}
		},
		[account, getMarketplaceContract, getNFTContract],
	);

	const delistNFT = useCallback(
		async (
			tokenId: string,
			nftContract: string,
		): Promise<MarketplaceResult> => {
			try {
				if (!account) {
					return { success: false, error: "Please connect your wallet" };
				}

				setLoading(true);
				setError(null);

				const marketplaceContract = await getMarketplaceContract(true);

				const tx = await marketplaceContract.cancelListing(
					tokenId,
					nftContract,
				);
				const receipt = await tx.wait();

				return {
					success: true,
					transactionHash: receipt.hash,
				};
			} catch (err) {
				console.error("Error delisting NFT:", err);
				const errorMessage = "Failed to delist NFT";
				setError(errorMessage);
				return {
					success: false,
					error: errorMessage,
				};
			} finally {
				setLoading(false);
			}
		},
		[account, getMarketplaceContract],
	);

	const getUserListings = useCallback(async (): Promise<Listing[]> => {
		try {
			if (!account) {
				return [];
			}

			const marketplaceContract = await getMarketplaceContract(true);
			const listings = await marketplaceContract.getUserListings();
			console.log(listings);

			return listings.map((listing: ContractListing) => ({
				tokenId: listing.tokenId.toString(),
				lister: listing.lister,
				nftContract: listing.nftContract,
				price: listing.price.toString(),
				isActive: listing.isActive,
				listedTime: listing.listedTime.toString(),
				soldAt: listing.soldAt.toString(),
			}));
		} catch (error) {
			console.error("Error fetching user listings:", error);
			return [];
		}
	}, [account, getMarketplaceContract]);

	const getListing = useCallback(
		async (tokenId: string, nftContract: string): Promise<Listing | null> => {
			try {
				const marketplaceContract = await getMarketplaceContract(false);
				const listing = await marketplaceContract.getListing(
					tokenId,
					nftContract,
				);

				if (!listing.isActive) {
					return null;
				}

				return {
					tokenId: listing.tokenId.toString(),
					lister: listing.lister,
					nftContract: listing.nftContract,
					price: listing.price.toString(),
					isActive: listing.isActive,
					listedTime: listing.listedTime.toString(),
					soldAt: listing.soldAt.toString(),
				};
			} catch (error) {
				console.error("Error fetching listing:", error);
				return null;
			}
		},
		[getMarketplaceContract],
	);

	const getPlatformFee = useCallback(
		async (tokenId: string, nftContract: string): Promise<string> => {
			try {
				const marketplaceContract = await getMarketplaceContract(false);
				const fee = await marketplaceContract.getPlatformFee(
					tokenId,
					nftContract,
				);
				return fee.toString();
			} catch (error) {
				console.error("Error fetching platform fee:", error);
				return "0";
			}
		},
		[getMarketplaceContract],
	);

	const updateListingPrice = useCallback(
		async (
			tokenId: string,
			nftContract: string,
			newPrice: string,
		): Promise<MarketplaceResult> => {
			try {
				if (!account) {
					return { success: false, error: "Please connect your wallet" };
				}

				setLoading(true);
				setError(null);

				const marketplaceContract = await getMarketplaceContract(true);

				// Convert price from ETH to Wei
				const priceInWei = ethers.parseEther(newPrice);

				const tx = await marketplaceContract.updateListing(
					tokenId,
					nftContract,
					priceInWei,
				);
				const receipt = await tx.wait();

				return {
					success: true,
					transactionHash: receipt.hash,
				};
			} catch (err) {
				console.error("Error updating listing:", err);
				const errorMessage = "Failed to update listing";
				setError(errorMessage);
				return {
					success: false,
					error: errorMessage,
				};
			} finally {
				setLoading(false);
			}
		},
		[account, getMarketplaceContract],
	);

	const getAllListings = useCallback(async (): Promise<Listing[]> => {
		try {
			const marketplaceContract = await getMarketplaceContract(false);

			const allListings = await marketplaceContract.getAllListings();

			return allListings.map((listing: ContractListing) => ({
				tokenId: listing.tokenId.toString(),
				lister: listing.lister,
				nftContract: listing.nftContract,
				price: listing.price.toString(),
				isActive: listing.isActive,
				listedTime: listing.listedTime.toString(),
				soldAt: listing.soldAt.toString(),
			}));
		} catch (error) {
			console.error("Error fetching all listings:", error);
			return [];
		}
	}, [getMarketplaceContract]);

	const buyNFT = useCallback(
		async (
			tokenId: string,
			nftContract: string,
			price: string,
		): Promise<MarketplaceResult> => {
			try {
				if (!account) {
					return { success: false, error: "Please connect your wallet" };
				}

				setLoading(true);
				setError(null);

				const marketplaceContract = await getMarketplaceContract(true);

				// Get platform fee
				const platformFee = await marketplaceContract.getPlatformFee(
					tokenId,
					nftContract,
				);
				const totalAmount = BigInt(price) + BigInt(platformFee.toString());

				const tx = await marketplaceContract.buyItem(tokenId, nftContract, {
					value: totalAmount,
				});

				const receipt = await tx.wait();

				return {
					success: true,
					transactionHash: receipt.hash,
				};
			} catch (err) {
				console.error("Error buying NFT:", err);
				const errorMessage = "Failed to buy NFT";
				setError(errorMessage);
				return {
					success: false,
					error: errorMessage,
				};
			} finally {
				setLoading(false);
			}
		},
		[account, getMarketplaceContract],
	);

	const getNFTMetadata = useCallback(
		async (tokenId: string): Promise<NFTMetadata | null> => {
			const contract = await getContract();
			const [tokenURI] = await Promise.all([contract.tokenURI(tokenId)]);
			return fetchMetadata(tokenURI);
		},
		[fetchMetadata, getContract],
	);

	useEffect(() => {
		if (account) {
			getUserNFTs();
		} else {
			setUserNFTs([]);
		}
	}, [account, getUserNFTs]);

	return {
		isMintEnabled,
		userNFTs,
		loading,
		error,
		checkMintStatus,
		mintWithRoyalty,
		getUserNFTs,
		getTotalSupply,
		getTokenOwner,
		fetchMetadata,
		transferNFT,
		safeTransferNFT,
		listNFT,
		delistNFT,
		getUserListings,
		getListing,
		getPlatformFee,
		updateListingPrice,
		buyNFT,
		getAllListings,
		getNFTMetadata,
	};
}
