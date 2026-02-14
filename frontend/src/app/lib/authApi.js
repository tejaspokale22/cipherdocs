const BASE_URL = "http://localhost:5000";

// request nonce
export async function requestNonce(walletAddress) {
  const res = await fetch(`${BASE_URL}/api/auth/request-nonce`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletAddress }),
  });

  if (!res.ok) {
    throw new Error("failed to fetch nonce");
  }

  return res.json();
}

// verify login
export async function verifyUser(payload) {
  const res = await fetch(`${BASE_URL}/api/auth/verify`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "verification failed");
  }

  return data;
}

// get current session
export async function getSession() {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/session`, {
      method: "GET",
      credentials: "include", // important for cookies
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    return null;
  }
}

// logout
export async function logout() {
  try {
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    toast.error("logout failed");
  }
}
