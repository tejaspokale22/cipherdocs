export const fetcher = async (url) => {
  const res = await fetch(url, {
    credentials: "include", // REQUIRED for HTTP-only JWT
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data.data || [];
};
