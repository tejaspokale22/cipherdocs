import crypto from "crypto";

// decrypt AES key (AES-256-CBC)
export const decryptAESKey = (encryptedAESKeyHex, envelopeIVHex) => {
  const masterKey = Buffer.from(process.env.MASTER_SECRET, "hex");

  if (masterKey.length !== 32) {
    throw new Error("MASTER_SECRET must be 32 bytes");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    masterKey,
    Buffer.from(envelopeIVHex, "hex"),
  );

  let decrypted = decipher.update(encryptedAESKeyHex, "hex", "hex");
  decrypted += decipher.final("hex");

  return Buffer.from(decrypted, "hex"); // returns 32-byte AES key
};

// decrypt file (AES-256-GCM)
export const decryptFileBuffer = (encryptedBuffer, aesKeyBuffer, fileIVHex) => {
  const iv = Buffer.from(fileIVHex, "hex");

  // last 16 bytes = auth tag
  const authTag = encryptedBuffer.slice(-16);
  const encryptedData = encryptedBuffer.slice(0, -16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", aesKeyBuffer, iv);

  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
};
