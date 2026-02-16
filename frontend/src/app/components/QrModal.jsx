"use client";

import { useEffect } from "react";
import { X, Share2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function QrModal({ open, onClose, qrSrc }) {
  // close on escape key
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);

    // prevent background scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose]);

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
      toast.success("QR link copied to clipboard");
    } catch {
      toast.error("Unable to share QR");
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
          <h3 className="text-lg font-semibold mb-4">Certificate QR Code</h3>

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

              <button
                onClick={handleShare}
                className="mt-6 flex items-center gap-2 px-6 py-3 rounded-lg bg-black text-white hover:bg-black/80 transition text-base cursor-pointer"
                type="button"
              >
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </>
          ) : (
            <p className="text-sm text-black/50">QR code not available</p>
          )}
        </div>
      </div>
    </div>
  );
}
