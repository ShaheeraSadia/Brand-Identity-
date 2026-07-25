export async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const text = await res.text();
  let data: any;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (_e) {
    // Response was not valid JSON (e.g. plain text or HTML error from server/proxy)
    if (!res.ok) {
      throw new Error(text || `Server error (${res.status})`);
    }
    throw new Error(`Invalid server response format: ${text.slice(0, 120)}`);
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}
