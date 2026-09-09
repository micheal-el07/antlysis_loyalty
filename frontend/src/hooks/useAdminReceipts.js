import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { friendlyErrorMessage } from "../utils/friendlyError";

// Omitting page/statusFilter entirely (call with no args) fetches every
// receipt, unpaginated — this is what the review queue, the admin
// dashboard's stats, and the nav's pending-count badge all rely on for an
// accurate total. Passing them turns pagination/filtering on, for the
// admin receipts list page.
export default function useAdminReceipts({ statusFilter, page, limit, search, dateFrom, dateTo } = {}) {
  const { token, logout } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const params = new URLSearchParams();
      if (page !== undefined) params.set("page", String(page));
      if (limit !== undefined) params.set("limit", String(limit));
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const qs = params.toString();

      const res = await fetch(`/api/v1/admin/receipts${qs ? `?${qs}` : ""}`, {
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
      setPagination(body.data.pagination);
      setStatus("ready");
    } catch (err) {
      setError(friendlyErrorMessage(err, "Couldn't load receipts."));
      setStatus("error");
    }
  }, [token, logout, statusFilter, page, limit, search, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateReceiptStatus(id, payload) {
    const res = await fetch(`/api/v1/admin/receipts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      logout();
      throw new Error("Your session has expired. Please sign in again.");
    }

    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body?.error?.message || `Request failed with status ${res.status}`);
    }

    setReceipts((current) =>
      current.map((r) => (r.id === id ? { ...r, ...body.data.receipt } : r))
    );
    return body.data;
  }

  return { receipts, pagination, status, error, reload: load, updateReceiptStatus };
}
