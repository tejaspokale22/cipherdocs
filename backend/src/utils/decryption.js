// import crypto from "crypto";

// // decrypt AES key (AES-256-CBC)
// export const decryptAESKey = (encryptedAESKeyHex, envelopeIVHex) => {
//   const masterKey = Buffer.from(process.env.MASTER_SECRET, "hex");

//   if (masterKey.length !== 32) {
//     throw new Error("MASTER_SECRET must be 32 bytes");
//   }

//   const decipher = crypto.createDecipheriv(
//     "aes-256-cbc",
//     masterKey,
//     Buffer.from(envelopeIVHex, "hex"),
//   );

//   let decrypted = decipher.update(encryptedAESKeyHex, "hex", "hex");
//   decrypted += decipher.final("hex");

//   return Buffer.from(decrypted, "hex"); // returns 32-byte AES key
// };

// // decrypt file (AES-256-GCM)
// export const decryptFileBuffer = (encryptedBuffer, aesKeyBuffer, fileIVHex) => {
//   const iv = Buffer.from(fileIVHex, "hex");

//   // last 16 bytes = auth tag
//   const authTag = encryptedBuffer.slice(-16);
//   const encryptedData = encryptedBuffer.slice(0, -16);

//   const decipher = crypto.createDecipheriv("aes-256-gcm", aesKeyBuffer, iv);

//   decipher.setAuthTag(authTag);

//   return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
// };

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
    Buffer.from(envelopeIVHex, "hex")
  );

  let decrypted = decipher.update(encryptedAESKeyHex, "hex", "hex");
  decrypted += decipher.final("hex");

  // IMPORTANT: this now supports variable key lengths (16/24/32 bytes)
  const aesKeyBuffer = Buffer.from(decrypted, "hex");

  if (![16, 24, 32].includes(aesKeyBuffer.length)) {
    throw new Error("Invalid AES key length.");
  }

  return aesKeyBuffer;
};

// decrypt file (Adaptive AES-GCM)
export const decryptFileBuffer = (encryptedBuffer, aesKeyBuffer, fileIVHex) => {
  const iv = Buffer.from(fileIVHex, "hex");

  // last 16 bytes = auth tag
  const authTag = encryptedBuffer.slice(-16);
  const encryptedData = encryptedBuffer.slice(0, -16);

  // dynamically detect algorithm
  const keySize = aesKeyBuffer.length * 8; // 128 / 192 / 256
  const algorithm = `aes-${keySize}-gcm`;

  const decipher = crypto.createDecipheriv(algorithm, aesKeyBuffer, iv);

  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);
};