export const MARKETPLACE_ABI = [
	{
		inputs: [],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner",
				type: "address",
			},
		],
		name: "OwnableInvalidOwner",
		type: "error",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address",
			},
		],
		name: "OwnableUnauthorizedAccount",
		type: "error",
	},
	{
		inputs: [],
		name: "ReentrancyGuardReentrantCall",
		type: "error",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "nftContract",
				type: "address",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "address",
				name: "lister",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newPrice",
				type: "uint256",
			},
		],
		name: "ListingUpdated",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "nftContract",
				type: "address",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "address",
				name: "lister",
				type: "address",
			},
		],
		name: "NFTDelisted",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "nftContract",
				type: "address",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "address",
				name: "lister",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
		],
		name: "NFTListed",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "nftContract",
				type: "address",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "address",
				name: "seller",
				type: "address",
			},
			{
				indexed: false,
				internalType: "address",
				name: "buyer",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
		],
		name: "NFTPurchased",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "OwnershipTransferred",
		type: "event",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_tokenId",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "_nftAddress",
				type: "address",
			},
		],
		name: "buyItem",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_tokenId",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "_nftAddress",
				type: "address",
			},
		],
		name: "cancelListing",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "generalListings",
		outputs: [
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "lister",
				type: "address",
			},
			{
				internalType: "address",
				name: "nftContract",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
			{
				internalType: "bool",
				name: "isActive",
				type: "bool",
			},
			{
				internalType: "uint256",
				name: "listedTime",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "soldAt",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getAllListings",
		outputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "tokenId",
						type: "uint256",
					},
					{
						internalType: "address",
						name: "lister",
						type: "address",
					},
					{
						internalType: "address",
						name: "nftContract",
						type: "address",
					},
					{
						internalType: "uint256",
						name: "price",
						type: "uint256",
					},
					{
						internalType: "bool",
						name: "isActive",
						type: "bool",
					},
					{
						internalType: "uint256",
						name: "listedTime",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "soldAt",
						type: "uint256",
					},
				],
				internalType: "struct Marketplace.Listing[]",
				name: "",
				type: "tuple[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getContractBalance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_tokenId",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "_nftAddress",
				type: "address",
			},
		],
		name: "getListing",
		outputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "tokenId",
						type: "uint256",
					},
					{
						internalType: "address",
						name: "lister",
						type: "address",
					},
					{
						internalType: "address",
						name: "nftContract",
						type: "address",
					},
					{
						internalType: "uint256",
						name: "price",
						type: "uint256",
					},
					{
						internalType: "bool",
						name: "isActive",
						type: "bool",
					},
					{
						internalType: "uint256",
						name: "listedTime",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "soldAt",
						type: "uint256",
					},
				],
				internalType: "struct Marketplace.Listing",
				name: "",
				type: "tuple",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getOwner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_tokenId",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "_nftAddress",
				type: "address",
			},
		],
		name: "getPlatformFee",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getUserListings",
		outputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "tokenId",
						type: "uint256",
					},
					{
						internalType: "address",
						name: "lister",
						type: "address",
					},
					{
						internalType: "address",
						name: "nftContract",
						type: "address",
					},
					{
						internalType: "uint256",
						name: "price",
						type: "uint256",
					},
					{
						internalType: "bool",
						name: "isActive",
						type: "bool",
					},
					{
						internalType: "uint256",
						name: "listedTime",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "soldAt",
						type: "uint256",
					},
				],
				internalType: "struct Marketplace.Listing[]",
				name: "",
				type: "tuple[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_tokenId",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "_nftAddress",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "_price",
				type: "uint256",
			},
		],
		name: "listItem",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "listings",
		outputs: [
			{
				internalType: "uint256",
				name: "tokenId",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "lister",
				type: "address",
			},
			{
				internalType: "address",
				name: "nftContract",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
			{
				internalType: "bool",
				name: "isActive",
				type: "bool",
			},
			{
				internalType: "uint256",
				name: "listedTime",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "soldAt",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_tokenId",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "_nftAddress",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "_newprice",
				type: "uint256",
			},
		],
		name: "updateListing",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "withdrawFunds",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
];
