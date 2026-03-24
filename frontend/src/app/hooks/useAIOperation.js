/**
 * Custom hook for AI operations with loading and error states
 */

import { useState } from "react";

export function useAIOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const execute = async (operation) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await operation();
      setResult(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || "Operation failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setResult(null);
  };

  return {
    loading,
    error,
    result,
    execute,
    reset,
  };
}

/**
 * Example usage:
 * 
 * const { loading, error, result, execute } = useAIOperation();
 * 
 * const handleExtract = async () => {
 *   await execute(() => extractText(file));
 * };
 * 
 * return (
 *   <div>
 *     <button onClick={handleExtract} disabled={loading}>
 *       {loading ? "Processing..." : "Extract"}
 *     </button>
 *     
 *     {error && <ErrorDisplay message={error} type="error" />}
 *     {result && <ResultDisplay>{result.text}</ResultDisplay>}
 *   </div>
 * );
 */
