import { useEffect, useState } from "react";

const DUMMY_DASHBOARD = {
  user: { name: "Priya Nandakumar" },
  stats: { pendingReceipts: 1, approvedReceipts: 2, availableVouchers: 2 },
  recentReceipts: [
    {
      id: "8f14e45f-ceea-467e-bd3f-0b47d3a5f1f2",
      orderId: "RC-1042",
      purchaseAmount: 64.18,
      submissionDate: "2026-09-02T00:00:00Z",
      status: "approved",
      rejectedReason: null,
    },
    {
      id: "a3c1b2f0-7d3e-4b1a-9c2d-1e5f6a7b8c9d",
      orderId: "RC-1041",
      purchaseAmount: 212.5,
      submissionDate: "2026-08-29T00:00:00Z",
      status: "pending",
      rejectedReason: null,
    },
    {
      id: "b4d2c3a1-8e4f-4c2b-ad3e-2f6a7b8c9d0e",
      orderId: "RC-1039",
      purchaseAmount: 18.75,
      submissionDate: "2026-08-24T00:00:00Z",
      status: "rejected",
      rejectedReason:
        "Image was too blurry to confirm the total. Please retake the photo in good light and resubmit.",
    },
  ],
};

export default function useDashboard() {
  const [data, setData] = useState(DUMMY_DASHBOARD);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        const body = await res.json();

        if (!res.ok || !body.success) {
          throw new Error(body?.error?.message || `Request failed with status ${res.status}`);
        }

        if (!cancelled) {
          setData(body.data);
          setStatus("ready");
        }
      } catch (err) {
        console.error("Failed to load dashboard, falling back to dummy data:", err);
        if (!cancelled) setStatus("ready");
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...data, status };
}
