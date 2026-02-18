"use client";

import { useState, useEffect } from "react";
import { Copy, Share2, X, Check } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function QrModal({ open, onClose, qrSrc, verifyUrl, cert }) {
  const [copy, setCopy] = useState(false);
  const handleShare = async () => {
    if (!qrSrc) return;
    try {
      // Try to share as an image file if supported
      if (navigator.canShare && window.fetch) {
        const res = await fetch(qrSrc);
        const blob = await res.blob();
        const file = new File([blob], "certificate-qr.png", {
          type: blob.type,
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Certificate QR Code",
            text: "Scan this QR code to verify the certificate.",
            files: [file],
          });
          return;
        }
      }
      // Fallback: share the link if possible
      if (navigator.share) {
        await navigator.share({
          title: "Certificate QR Code",
          text: "Scan this QR code to verify the certificate.",
          url: qrSrc,
        });
        return;
      }
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(qrSrc);
      toast.success("QR link copied to clipboard.");
    } catch {
      toast.error("Unable to share QR");
    }
  };

  const handleCopyLink = async () => {
    if (!verifyUrl) {
      toast.error("Verification link not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(verifyUrl);

      setCopy(true);

      // reset after 1600ms
      setTimeout(() => {
        setCopy(false);
      }, 1400);

      toast.success("Verification link copied.");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition cursor-pointer"
          aria-label="Close modal"
          type="button"
        >
          <X className="h-5 w-5 text-black/60" />
        </button>

        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-center mb-3">
            {cert?.name ?? "Certificate QR Code"}
            <p className="text-sm text-black/80 font-light mt-1">
              Share and verify instantly.
            </p>
          </h3>

          {qrSrc ? (
            <>
              <Image
                src={qrSrc}
                alt="Certificate QR Code"
                width={360}
                height={360}
                className="rounded-xl border-2 border-black/20"
                unoptimized
              />

              <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                  onClick={handleShare}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-black text-white hover:bg-black/80 transition text-sm sm:text-base cursor-pointer"
                  type="button"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-black/30 text-sm text-black hover:bg-black/5 transition cursor-pointer"
                  type="button"
                >
                  {copy ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <Copy className="h-6 w-6" />
                  )}
                  Copy verification link
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-black/50">QR code not available</p>
          )}
        </div>
      </div>
    </div>
  );
}
