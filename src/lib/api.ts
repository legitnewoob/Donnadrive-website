const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request(method: string, path: string, body?: unknown) {
  const token = localStorage.getItem("donna_access_token");

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    let error = text;
    try {
      const parsed = JSON.parse(text);
      error = parsed.error || parsed.message || text;
    } catch {
      // keep raw text
    }
    throw new Error(error || "Request failed");
  }

  return res.json();
}

export const api = {
  get: (path: string) => request("GET", path),
  post: (path: string, body?: unknown) => request("POST", path, body),
};
