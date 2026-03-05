const backendBase = process.env.NEXT_PUBLIC_API_URL;

export async function sendChatMessage(payload, signal) {
  const res = await fetch(`${backendBase}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: payload.message,
      history: payload.history,
    }),
    cache: "no-store",
    signal,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: data?.message || "AI assistant failed",
    };
  }
  return data ?? { success: false, message: "Invalid AI response" };
}
