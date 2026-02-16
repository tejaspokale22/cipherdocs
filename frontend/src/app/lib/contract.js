import { ethers } from "ethers";
import ABI from "@/app/abi/CipherDocs.json";

const CONTRACT_ADDRESS = "0x61d9B4Ed14c5e772f3293D6cC3472a1691023229";

export const getCipherDocsContract = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
};
