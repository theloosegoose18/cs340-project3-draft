export async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
        ...options,
    });

    const text = await res.text();
    const payload = text ? JSON.parse(text) : null;

    if (!res.ok) {
        // If backend uses { ok:false, error:"..." }
        const msg =
            payload?.error ??
            payload?.message ??
            `HTTP ${res.status}`;
        throw new Error(msg);
    }

    // ✅ Auto-unwrap { ok:true, data: ... }
    if (payload && typeof payload === "object" && "ok" in payload && "data" in payload) {
        return payload.data;
    }

    return payload;
}