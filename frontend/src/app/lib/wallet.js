import { BrowserProvider } from "ethers";

// connect wallet and return signer + address
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("metamask not installed");
  }

  const provider = new BrowserProvider(window.ethereum);

  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

// sign message
export async function signMessage(signer, message) {
  return signer.signMessage(message);
}
