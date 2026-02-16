"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import toast from "react-hot-toast";

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
        toast.error("Invalid QR code");
        setLoading(false);
        return;
      }

      const url = code.data;

      // ensure it's a valid verify link
      if (!url.includes("/verify/")) {
        toast.error("Invalid CipherDocs QR");
        setLoading(false);
        return;
      }

      toast.success("QR decoded successfully");
      router.push(url);
    } catch (error) {
      toast.error("Failed to read QR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-12 px-6 md:px-20 lg:px-36">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black">
            Verify Certificate
          </h1>
          <p className="text-black/50 mt-1">
            Upload a QR code shared by the certificate holder to verify its
            authenticity. CipherDocs ensures secure and tamper-proof validation.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-black/10 overflow-hidden max-w-xl mx-auto">
          <div className="px-6 py-4 border-b border-black/10">
            <h2 className="font-semibold">Scan QR Code</h2>
          </div>
          <div className="p-8 flex flex-col items-center justify-center">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-black/20 rounded-xl p-10 cursor-pointer hover:border-black transition w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={loading}
              />
              {loading ? (
                <p className="text-black font-medium">Scanning QR...</p>
              ) : (
                <>
                  <p className="text-black font-medium">
                    Click to upload QR code
                  </p>
                  <p className="text-black/40 text-sm mt-2">
                    PNG, JPG supported
                  </p>
                </>
              )}
            </label>
          </div>
        </div>
      </div>
    </main>
  );
}
