import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { friendlyErrorMessage } from "../utils/friendlyError";

// Omitting page entirely (call with no args) fetches every voucher,
// unpaginated — used where an accurate total matters more than a single
// page (e.g. the admin dashboard's "Issued vouchers" count). Passing it
// turns pagination on, for the voucher list pages.
export default function useVouchers({ page, limit } = {}) {
  const { token, logout } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [availableAmount, setAvailableAmount] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const params = new URLSearchParams();
      if (page !== undefined) params.set("page", String(page));
      if (limit !== undefined) params.set("limit", String(limit));
      const qs = params.toString();

      const res = await fetch(`/api/v1/vouchers${qs ? `?${qs}` : ""}`, {
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

      setVouchers(body.data.vouchers);
      setPagination(body.data.pagination);
      setAvailableAmount(body.data.availableAmount);
      setStatus("ready");
    } catch (err) {
      setError(friendlyErrorMessage(err, "Couldn't load your vouchers."));
      setStatus("error");
    }
  }, [token, logout, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { vouchers, pagination, availableAmount, status, error, reload: load };
}
