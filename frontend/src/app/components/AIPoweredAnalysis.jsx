import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const AI_STATUS_CONFIG = {
  authentic: {
    badge: "AUTHENTIC",
    badgeCls: "bg-green-600 text-white",
  },
  tampered: {
    badge: "TAMPERED",
    badgeCls: "bg-red-600 text-white",
  },
  expired: {
    badge: "EXPIRED",
    badgeCls: "bg-orange-500 text-white",
  },
  revoked: {
    badge: "REVOKED",
    badgeCls: "bg-red-600 text-white",
  },
};

const SkeletonLine = ({ width = "100%" }) => {
  return (
    <div
      className="relative h-5 rounded bg-black/10 overflow-hidden"
      style={{ width }}
    >
      <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white to-transparent" />
    </div>
  );
};

const Skeleton = () => {
  return (
    <div className="space-y-3 mt-6">
      <SkeletonLine />
      <SkeletonLine width="92%" />
      <SkeletonLine width="96%" />
      <SkeletonLine width="85%" />
      <SkeletonLine width="70%" />
    </div>
  );
};

const AIPoweredAnalysis = ({ certId, file, verificationResult }) => {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState("");
  const [aiStatus, setAiStatus] = useState(null);
  const lastRequestKeyRef = useRef(null);

  useEffect(() => {
    if (!file || !verificationResult || !certId) {
      setLoading(false);
      return;
    }

    if (verificationResult.status === "error") {
      setLoading(false);
      setAnalysis("");
      setAiStatus(null);
      return;
    }

    const requestKey = [
      certId,
      verificationResult.status,
      verificationResult.issuedAt,
      verificationResult.expiry,
      verificationResult.revokedAt,
      file.name,
      file.size,
      file.lastModified,
    ]
      .filter(Boolean)
      .join("|");

    if (lastRequestKeyRef.current === requestKey) {
      return;
    }

    lastRequestKeyRef.current = requestKey;
    setLoading(true);
    setAnalysis("");
    setAiStatus(null);

    const runAIAnalysis = async () => {
      try {
        const formData = new FormData();

        formData.append("file", file);
        formData.append(
          "verificationResult",
          JSON.stringify(verificationResult),
        );
        formData.append("certId", certId);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ai/ai-analysis`,
          {
            method: "POST",
            body: formData,
          },
        );

        const data = await res.json();

        setAnalysis(data.analysis ?? "");
        setAiStatus(data.aiStatus ?? null);
      } catch (error) {
        console.error("AI analysis failed:", error);
        setAnalysis("Please try again.");
        setAiStatus(null);
      } finally {
        setLoading(false);
      }
    };

    runAIAnalysis();
  }, [file, certId, verificationResult]);

  const aiCfg = aiStatus ? AI_STATUS_CONFIG[aiStatus] : null;

  return (
    <section className="mt-8 max-w-6xl mx-auto">
      <div className="rounded-2xl border border-black/30 bg-white overflow-hidden">
        <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-4 border-b border-black/10 bg-gray-50">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-lg shadow-sm">
                <span className="text-white">🤖</span>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-black">
                  AI-Powered Analysis
                </h2>
              </div>
            </div>
            {aiCfg && (
              <span
                className={`font-mono text-xs font-semibold rounded-full px-2.5 py-0.5 tracking-widest ${aiCfg.badgeCls}`}
              >
                {aiCfg.badge}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-6 sm:pb-7">
          {/* Content */}
          {loading ? (
            <Skeleton />
          ) : analysis ? (
            <div className="mt-6 space-y-3 text-sm leading-relaxed text-gray-800">
              <ReactMarkdown
                components={{
                  h2: ({ node, ...props }) => (
                    <h3
                      className="mt-5 text-sm font-semibold text-black first:mt-0"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-sm text-gray-700" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-gray-700"
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => <li {...props} />,
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-black/15 bg-gray-50 px-4 py-3 text-sm text-gray-500">
              No AI analysis is available for this certificate yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AIPoweredAnalysis;
