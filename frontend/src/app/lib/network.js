const AMOY_CHAIN_ID = "0x13882";

export async function ensureAmoyNetwork() {
  const currentChainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (currentChainId === AMOY_CHAIN_ID) {
    return;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: AMOY_CHAIN_ID }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x13882", // 80002
            chainName: "Polygon Amoy Testnet",
            nativeCurrency: {
              name: "POL",
              symbol: "POL",
              decimals: 18,
            },
            rpcUrls: ["https://rpc-amoy.polygon.technology"],
            blockExplorerUrls: ["https://amoy.polygonscan.com"],
          },
        ],
      });

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_CHAIN_ID }],
      });
    } else {
      throw error;
    }
  }
}
