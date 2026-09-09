import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { friendlyErrorMessage } from "../utils/friendlyError";

export default function useDashboard() {
  const { token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/dashboard", {
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

      setData(body.data);
      setStatus("ready");
    } catch (err) {
      setError(friendlyErrorMessage(err, "Couldn't load your dashboard."));
      setStatus("error");
    }
  }, [token, logout]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, status, error, reload: load };
}
