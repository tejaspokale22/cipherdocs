export const fetcher = async (url) => {
  const res = await fetch(url, {
    credentials: "include",
  });

  let json;

  try {
    json = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(json?.message || "Request failed");
  }

  // return data field if present, otherwise return full json
  return json?.data ?? json;
};
