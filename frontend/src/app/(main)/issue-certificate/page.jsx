"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FileText, Upload, Calendar, Wallet, X } from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Spinner from "@/app/components/Spinner";
import { getCipherDocsContract } from "@/app/lib/contract.js";
import { ethers } from "ethers";
import { mutate } from "swr";
import { MY_CERTIFICATES, ISSUED_CERTIFICATES } from "@/app/lib/constants";

export default function IssueCertificatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    recipientAddress: "",
    expiryDate: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      toast.error("please select a valid PDF file");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return; // prevent double execution

    if (!selectedFile) {
      toast.error("original certificate is required");
      return;
    }

    const toastId = toast.loading("encrypting file...");

    try {
      setIsLoading(true);

      // read file
      const fileArrayBuffer = await selectedFile.arrayBuffer();

      // compute original hash before encryption
      const originalHashBuffer = await crypto.subtle.digest(
        "SHA-256",
        fileArrayBuffer,
      );

      const originalDocumentHash = Array.from(
        new Uint8Array(originalHashBuffer),
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // generate aes key
      const aesKey = crypto.getRandomValues(new Uint8Array(32));

      // generate iv
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // encrypt file using aes-gcm
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        aesKey,
        { name: "AES-GCM" },
        false,
        ["encrypt"],
      );

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        fileArrayBuffer,
      );

      // convert encrypted file to base64
      const encryptedArray = new Uint8Array(encryptedBuffer);
      let binaryString = "";
      const chunkSize = 8192;

      for (let i = 0; i < encryptedArray.length; i += chunkSize) {
        const chunk = encryptedArray.subarray(i, i + chunkSize);
        binaryString += String.fromCharCode.apply(null, chunk);
      }

      const encryptedBase64 = btoa(binaryString);

      // convert aes key and iv to hex
      const aesKeyHex = Array.from(aesKey)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const ivHex = Array.from(iv)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      toast.loading("wait a moment...", { id: toastId });

      // call backend prepare
      const prepareRes = await fetch(
        "http://localhost:5000/api/certificates/prepare",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: formDatea.name,
            recipientWallet: formData.recipientAddress,
            encryptedFileBase64: encryptedBase64,
            aesKeyHex,
            ivHex,
            expiryDate: formData.expiryDate || null,
            originalDocumentHash,
          }),
        },
      );

      const prepareData = await prepareRes.json();

      // handle duplicate certificate (409)
      if (prepareRes.status === 409) {
        toast.dismiss(toastId);
        toast.error(
          "Active  certificate already exists. Revoke it before re-issuing.",
        );
        setIsLoading(false);
        return;
      }

      // handle other errors
      if (!prepareRes.ok) {
        toast.dismiss(toastId);
        toast.error("prepare failed");
        setIsLoading(false);
        return;
      }

      const {
        encryptedDocumentHash,
        ipfsCID,
        encryptedAESKey,
        fileIV,
        envelopeIV,
        recipientId,
      } = prepareData.data;

      toast.loading("waiting for metamask confirmation...", { id: toastId });

      const AMOY_CHAIN_ID = "0x13882";

      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      if (currentChainId !== AMOY_CHAIN_ID) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: AMOY_CHAIN_ID }],
        });
      }

      const contract = await getCipherDocsContract();

      let expiryTimestamp = 0;

      if (formData.expiryDate) {
        expiryTimestamp = Math.floor(
          new Date(formData.expiryDate).getTime() / 1000,
        );
      }

      const tx = await contract.issueCertificate(
        "0x" + encryptedDocumentHash,
        ipfsCID,
        formData.recipientAddress,
        expiryTimestamp,
        {
          maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
          maxFeePerGas: ethers.parseUnits("50", "gwei"),
        },
      );

      toast.loading("confirming transaction...", { id: toastId });

      const receipt = await tx.wait();

      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((log) => log && log.name === "CertificateIssued");

      if (!event) {
        throw new Error("certificateissued event not found");
      }

      const contractCertificateId = event.args.certificateId.toString();

      toast.loading("issuing certificate...", { id: toastId });

      const issueRes = await fetch(
        "http://localhost:5000/api/certificates/issue",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: formData.name,
            originalDocumentHash,
            encryptedDocumentHash,
            ipfsCID,
            encryptedAESKey,
            fileIV,
            envelopeIV,
            recipientId,
            blockchainTxHash: receipt.hash,
            contractCertificateId,
            expiryDate: formData.expiryDate || null,
          }),
        },
      );

      const issueData = await issueRes.json();

      if (!issueRes.ok) {
        throw new Error(issueData.message || "issue failed");
      }

      toast.success("certificate issued successfully", { id: toastId });
      await mutate(MY_CERTIFICATES);
      await mutate(ISSUED_CERTIFICATES);
      router.push("/issuer-dashboard");
    } catch (error) {
      toast.error("something went wrong", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="issuer">
      <main className="min-h-screen bg-linear-to-b from-black/5 to-white pb-12 px-4 pt-23">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-semibold text-black">
              Issue new Certificate
            </h1>
            <p className="text-black/50 mt-1">
              Create and issue a new blockchain-verified certificate.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Certificate Title */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Certificate Name<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/30" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter certificate name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-black/10 bg-black/2 text-base placeholder:text-black/40 focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                </div>

                {/* Recipient Wallet Address */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Recipient Wallet Address
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/30" />
                    <input
                      type="text"
                      name="recipientAddress"
                      placeholder="0x..."
                      value={formData.recipientAddress}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-black/10 bg-black/2 text-base placeholder:text-black/40 focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Expiry Date</label>
                  <span className="text-xs text-black/50 mb-1">
                    Add expiry date only if the certificate has an expiry. Leave
                    blank if it is lifetime.
                  </span>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/30" />
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-black/10 bg-black/2 text-base placeholder:text-black/40 focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Orginal Certificate Document (PDF)
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {!selectedFile ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-black/20 rounded-lg cursor-pointer hover:border-black/40 hover:bg-black/2 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-black/30 mb-2" />
                          <p className="text-sm text-black/50">
                            <span className="font-medium text-black/70">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-black/40 mt-1">
                            PDF only (max 10mb)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-black/5 border border-black/10">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-black/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-black/50" />
                          </div>
                          <div>
                            <p className="text-sm font-medium truncate max-w-50 md:max-w-75">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-black/50">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="h-8 w-8 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
                        >
                          <X className="h-4 w-4 text-black/50" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Spinner size="md" variant="light" />
                    </>
                  ) : (
                    "Issue Certificate"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
