import axios from "axios";
import FormData from "form-data";

const PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadToIPFS = async (fileBuffer) => {
  try {
    // Validate buffer
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw new Error("Invalid file buffer");
    }

    // Validate file size
    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error("File size exceeds allowed limit");
    }

    // Ensure Pinata JWT exists
    if (!process.env.PINATA_JWT) {
      throw new Error("PINATA_JWT not configured");
    }

    const formData = new FormData();

    formData.append("file", fileBuffer, {
      filename: `cipherdocs-${Date.now()}.bin`,
    });

    const response = await axios.post(PINATA_URL, formData, {
      maxBodyLength: Infinity,
      timeout: 20000,
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        ...formData.getHeaders(),
      },
    });

    if (!response.data || !response.data.IpfsHash) {
      throw new Error("Invalid response from IPFS provider");
    }

    return response.data.IpfsHash;
  } catch (error) {
    const message =
      error.response?.data?.error || error.response?.data || error.message;

    console.error("IPFS Upload Error:", message);
    throw new Error("Failed to upload file to IPFS");
  }
};
