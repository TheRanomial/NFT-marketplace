import { useCallback, useEffect, useState } from "react";

declare global {
	interface Window {
		ethereum: import("ethers").Eip1193Provider;
	}
}

export function useMetaMask() {
	const [isConnected, setIsConnected] = useState(false);
	const [account, setAccount] = useState<string | null>(null);
	const [chainId, setChainId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const disconnect = useCallback(() => {
		setIsConnected(false);
		setAccount(null);
		setChainId(null);
		setError(null);
	}, []);

	const isMetaMaskInstalled = useCallback(() => {
		return (
			typeof window !== "undefined" && typeof window.ethereum !== "undefined"
		);
	}, []);

	const checkConnection = useCallback(async () => {
		if (!isMetaMaskInstalled()) {
			setError("MetaMask is not installed");
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			const accounts = await window.ethereum.request({
				method: "eth_accounts",
			});

			if (accounts.length > 0) {
				setIsConnected(true);
				setAccount(accounts[0]);
				const chain = await window.ethereum.request({
					method: "eth_chainId",
				});
				setChainId(chain);
			} else {
				setIsConnected(false);
				setAccount(null);
				setChainId(null);
			}
		} catch (err) {
			console.error("Error checking connection:", err);
			setError("Failed to check connection");
		} finally {
			setIsLoading(false);
		}
	}, [isMetaMaskInstalled]);

	const connect = useCallback(async () => {
		if (!isMetaMaskInstalled()) {
			setError("MetaMask is not installed");
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});

			if (accounts.length > 0) {
				const address = accounts[0];
				const chain = await window.ethereum.request({
					method: "eth_chainId",
				});

				setAccount(address);
				setChainId(chain);
				setIsConnected(true);
			} else {
				setError("No accounts found");
			}
		} catch (error) {
			console.error("Error connecting to MetaMask:", error);
			return;
		} finally {
			setIsLoading(false);
		}
	}, [isMetaMaskInstalled]);

	const switchNetwork = useCallback(
		async (targetChainId: string) => {
			if (!isMetaMaskInstalled()) {
				setError("MetaMask is not installed");
				return;
			}

			try {
				setIsLoading(true);
				setError(null);

				await window.ethereum.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: targetChainId }],
				});
			} catch (err) {
				console.error("Error switching network:", err);
			} finally {
				setIsLoading(false);
			}
		},
		[isMetaMaskInstalled],
	);

	const addNetwork = useCallback(
		async (networkConfig: {
			chainId: string;
			chainName: string;
			nativeCurrency: { name: string; symbol: string; decimals: number };
			rpcUrls: string[];
			blockExplorerUrls?: string[];
		}) => {
			if (!isMetaMaskInstalled()) {
				setError("MetaMask is not installed");
				return;
			}

			try {
				setIsLoading(true);
				setError(null);

				await window.ethereum.request({
					method: "wallet_addEthereumChain",
					params: [networkConfig],
				});
			} catch (err) {
				console.error("Error adding network:", err);
				setError("Failed to add network");
			} finally {
				setIsLoading(false);
			}
		},
		[isMetaMaskInstalled],
	);

	useEffect(() => {
		if (!isMetaMaskInstalled()) {
			return;
		}
		checkConnection();
	}, [checkConnection, isMetaMaskInstalled]);

	return {
		isConnected,
		account,
		chainId,
		isLoading,
		error,
		connect,
		disconnect,
		switchNetwork,
		addNetwork,
		isMetaMaskInstalled: isMetaMaskInstalled(),
	};
}
