"use client";

import { ErrorDisplay, LoadingDisplay, ResultDisplay } from "./ErrorDisplay";

/**
 * AI Operation Wrapper Component
 * Wraps AI operations with consistent loading, error, and result display
 */
export default function AIOperationWrapper({
  loading,
  error,
  result,
  loadingMessage = "Processing...",
  resultTitle,
  children,
  renderResult,
}) {
  if (loading) {
    return <LoadingDisplay message={loadingMessage} />;
  }

  if (error) {
    return (
      <div className="space-y-6 mt-4">
        <ErrorDisplay message={error} type="error" />
        {children}
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-6 mt-4">
        {renderResult ? (
          renderResult(result)
        ) : (
          <ResultDisplay title={resultTitle}>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </ResultDisplay>
        )}
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
