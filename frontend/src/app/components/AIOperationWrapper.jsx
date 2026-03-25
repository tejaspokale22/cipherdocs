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
  errorTitle = "Operation Failed",
  resultTitle,
  children,
  renderResult,
}) {
  if (loading) {
    return <LoadingDisplay message={loadingMessage} />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorDisplay message={error} type="error" />
        {children}
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-4">
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

/**
 * Example usage:
 * 
 * const { loading, error, result, execute } = useAIOperation();
 * 
 * return (
 *   <AIOperationWrapper
 *     loading={loading}
 *     error={error}
 *     result={result}
 *     loadingMessage="Extracting text..."
 *     resultTitle="Extracted Text"
 *     renderResult={(data) => (
 *       <div>
 *         <p>{data.text}</p>
 *         <p className="text-sm text-gray-600">
 *           {data.word_count} words
 *         </p>
 *       </div>
 *     )}
 *   >
 *     <button onClick={() => execute(() => extractText(file))}>
 *       Extract Text
 *     </button>
 *   </AIOperationWrapper>
 * );
 */
