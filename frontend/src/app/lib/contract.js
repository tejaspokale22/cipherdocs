import { ethers } from "ethers";
import ABI from "@/app/abi/CipherDocs.json";

const CONTRACT_ADDRESS = "0x39229Cf6eD13570b545f8250988DbE83e896758f";

export const getCipherDocsContract = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
};
