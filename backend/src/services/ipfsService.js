import axios from "axios";
import FormData from "form-data";
import crypto from "crypto";

const PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadToIPFS = async (fileBuffer) => {
  // Generate deterministic file hash (idempotency base)
  const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  const requestId = crypto.randomUUID();

  console.log(`[IPFS] [${requestId}] Starting upload. Hash: ${fileHash}`);

  try {
    // Validate buffer
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw new Error("Invalid file buffer");
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error("File size exceeds allowed limit");
    }

    if (!process.env.PINATA_JWT) {
      throw new Error("PINATA_JWT not configured");
    }

    const formData = new FormData();

    // Use content hash instead of timestamp
    formData.append("file", fileBuffer, {
      filename: `cipherdocs-${fileHash}.bin`,
    });

    const response = await axios.post(PINATA_URL, formData, {
      maxBodyLength: MAX_FILE_SIZE,
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        ...formData.getHeaders(),
      },
      validateStatus: (status) => status >= 200 && status < 300,
    });

    if (!response.data?.IpfsHash) {
      throw new Error("Invalid response from IPFS provider");
    }

    console.log(
      `[IPFS] [${requestId}] Upload successful. CID: ${response.data.IpfsHash}`,
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error(`[IPFS] [${requestId}] Upload failed:`, error.message);
    throw new Error("Failed to upload file to IPFS");
  }
};

export const getCertificateFromIPFS = async (cid) => {
  try {
    if (!cid) {
      throw new Error("CID is required");
    }

    if (!process.env.IPFS_GATEWAY) {
      throw new Error("IPFS_GATEWAY not configured");
    }

    const url = `${process.env.IPFS_GATEWAY}/${cid}`;

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error("[IPFS] Download failed:", error.message);
    throw new Error("Failed to fetch file from IPFS");
  }
};
