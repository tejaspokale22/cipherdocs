"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode } from "lucide-react";
import jsQR from "jsqr";
import toast from "react-hot-toast";

// Safely extract the internal /verify/... path from a full URL or path string.
// Returns null if the string does not contain a verification route.
function getVerifyPath(value) {
  if (!value || typeof value !== "string") return null;
  const marker = "/verify/";
  const idx = value.indexOf(marker);
  if (idx === -1) return null;
  return value.slice(idx);
}

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  const handleVerificationLinkSubmit = (e) => {
    e.preventDefault();

    const trimmed = linkInput.trim();
    if (!trimmed) {
      toast.error("Paste a verification link to continue");
      return;
    }

    const path = getVerifyPath(trimmed);

    if (!path) {
      toast.error("Enter a valid CipherDocs verification link");
      return;
    }

    router.push(path);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      const imageBitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      ctx.drawImage(imageBitmap, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (!code) {
        toast.error("Invalid QR code.");
        setLoading(false);
        return;
      }

      const url = code.data?.trim();
      const path = getVerifyPath(url);

      if (!path) {
        toast.error("Invalid CipherDocs QR.");
        setLoading(false);
        return;
      }

      toast.success("QR decoded successfully.");
      router.push(path);
    } catch (error) {
      toast.error("Failed to read QR.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Page header */}
          <div className="mb-10 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              Instantly verify any issued certificate
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-500">
              Upload a QR image or paste a verification link to jump straight to
              the verification page.
            </p>
          </div>

          {/* Main layout */}
          <div className="max-w-2xl mx-auto">
            {/* Centered actions card */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-black/30 overflow-hidden">
                {/* Card header */}
                <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-black/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center shrink-0">
                      <QrCode className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-500 tracking-[0.18em] uppercase">
                      Verify certificate
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-500">
                    Scan a QR code or paste a verification link to open the
                    certificate detail page.
                  </p>
                </div>

                {/* Card body */}
                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-5 space-y-8">
                  {/* QR upload */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">
                      Option 1 - Upload QR code
                    </p>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-black/20 rounded-xl p-6 sm:p-8 cursor-pointer hover:border-black/60 hover:bg-gray-50 transition w-full text-center">
                      <span className="sr-only">Upload QR code image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={loading}
                      />
                      {loading ? (
                        <p className="text-sm sm:text-base font-medium">
                          Scanning QR...
                        </p>
                      ) : (
                        <>
                          <p className="text-sm sm:text-base font-medium">
                            Click to upload QR code
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-2">
                            PNG, JPG supported
                          </p>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="uppercase tracking-[0.18em]">
                      Or paste link
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  {/* Verification link */}
                  <form
                    onSubmit={handleVerificationLinkSubmit}
                    className="space-y-2"
                  >
                    <div className="space-y-1.5">
                      <label
                        htmlFor="verification-link"
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500"
                      >
                        Option 2 - Paste Verification link
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          id="verification-link"
                          type="url"
                          placeholder="Paste a link that contains /verify/…"
                          value={linkInput}
                          onChange={(e) => setLinkInput(e.target.value)}
                          className="flex-1 rounded-lg border border-black/20 px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition bg-white"
                        />
                        <button
                          type="submit"
                          disabled={!linkInput.trim()}
                          className="inline-flex items-center justify-center rounded-lg bg-black text-white px-4 py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/80 transition cursor-pointer"
                        >
                          Open link
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      You&apos;ll be redirected to the certificate-specific
                      verification page for a full on-chain integrity check.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
