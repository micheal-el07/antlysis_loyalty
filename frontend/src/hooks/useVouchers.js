import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const DUMMY_VOUCHERS = [
  {
    id: "e1a2b3c4-5b6a-4a2b-8c3d-1e2f3a4b5c6d",
    receipt_id: "8f14e45f-ceea-467e-bd3f-0b47d3a5f1f2",
    amount: 10,
    expiry_date: "2026-11-01T00:00:00Z",
    created_at: "2026-09-03T15:33:00Z",
  },
  {
    id: "f2b3c4d5-6c7b-4b3c-9d4e-2f3a4b5c6d7e",
    receipt_id: "c5e3d4b2-9f5a-4d3c-be4f-3a7b8c9d0e1f",
    amount: 5,
    expiry_date: "2026-09-20T00:00:00Z",
    created_at: "2026-08-16T10:05:00Z",
  },
];

export default function useVouchers() {
  const { token } = useAuth();
  const [vouchers, setVouchers] = useState(DUMMY_VOUCHERS);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadVouchers() {
      try {
        const res = await fetch("/api/vouchers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();

        if (!res.ok || !body.success) {
          throw new Error(body?.error?.message || `Request failed with status ${res.status}`);
        }

        if (!cancelled) {
          setVouchers(body.data);
          setStatus("ready");
        }
      } catch (err) {
        console.error("Failed to load vouchers, falling back to dummy data:", err);
        if (!cancelled) setStatus("ready");
      }
    }

    loadVouchers();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { vouchers, status };
}
