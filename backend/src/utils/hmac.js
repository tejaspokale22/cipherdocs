import crypto from "crypto";

export const getDocumentHMAC = (originalDocumentHash) => {
  const documentHMAC = crypto
    .createHmac("sha256", process.env.HMAC_SECRET)
    .update(originalDocumentHash)
    .digest("hex");
  return documentHMAC;
};
