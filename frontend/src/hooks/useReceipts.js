import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function useReceipts() {
  const { token, logout } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/v1/receipts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // A dead/expired token is an auth problem, not a "backend is down"
      // problem — sign the user out so ProtectedRoute bounces them to
      // /login instead of showing an error banner for something that isn't
      // one.
      if (res.status === 401) {
        logout();
        return;
      }

      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body?.error?.message || `Request failed with status ${res.status}`);
      }

      setReceipts(body.data.receipts);
      setStatus("ready");
    } catch (err) {
      setError(err.message || "Couldn't load your receipts.");
      setStatus("error");
    }
  }, [token, logout]);

  useEffect(() => {
    load();
  }, [load]);

  return { receipts, status, error, reload: load };
}
