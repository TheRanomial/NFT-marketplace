import axios, { type AxiosError, type AxiosResponse } from "axios";

// Define interface for Pinata response
interface PinataResponse {
	success: boolean;
	pinataUrl?: string;
	message?: string;
}

// Define interface for Pinata API response data
interface PinataApiResponse {
	IpfsHash: string;
	PinSize: number;
	Timestamp: string;
}

// Standard NFT metadata interface (OpenSea standard)
interface NFTMetadata {
	name: string;
	description: string;
	image: string;
	external_url?: string;
	animation_url?: string;
	attributes?: Array<{
		trait_type: string;
		value: string | number;
		display_type?:
			| "string"
			| "number"
			| "date"
			| "boost_percentage"
			| "boost_number";
	}>;
	background_color?: string;
	properties?: Record<string, unknown>;
	[key: string]: unknown; // Allow for extensions but typed as unknown
}

export const pinJSONToIPFS = async (
	JSONBody: NFTMetadata,
): Promise<PinataResponse> => {
	const key = process.env.NEXT_PUBLIC_PINATA_KEY;
	const secret = process.env.NEXT_PUBLIC_PINATA_SECRET;

	if (!key || !secret) {
		return {
			success: false,
			message: "Pinata API keys are not configured",
		};
	}

	const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

	try {
		const response: AxiosResponse<PinataApiResponse> = await axios.post(
			url,
			JSONBody,
			{
				headers: {
					pinata_api_key: key,
					pinata_secret_api_key: secret,
				},
			},
		);

		return {
			success: true,
			pinataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
		};
	} catch (error) {
		const axiosError = error as AxiosError;
		console.error("Pinata error:", axiosError);

		return {
			success: false,
			message: axiosError.message,
		};
	}
};
