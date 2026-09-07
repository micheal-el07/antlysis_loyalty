import { useEffect, useState } from "react";

const DUMMY_RECEIPTS = [
  {
    id: "8f14e45f-ceea-467e-bd3f-0b47d3a5f1f2",
    orderId: "RC-1042",
    purchaseDate: "2026-09-01T00:00:00Z",
    purchaseAmount: 64.18,
    status: "approved",
    submissionDate: "2026-09-02T14:30:00Z",
    approvedAt: "2026-09-03T15:33:00Z",
    rejectedReason: null,
    imageUrl: "/uploads/receipts/abc123.jpg",
  },
  {
    id: "a3c1b2f0-7d3e-4b1a-9c2d-1e5f6a7b8c9d",
    orderId: "RC-1041",
    purchaseDate: "2026-08-28T00:00:00Z",
    purchaseAmount: 212.5,
    status: "pending",
    submissionDate: "2026-08-29T09:40:00Z",
    approvedAt: null,
    rejectedReason: null,
    imageUrl: "/uploads/receipts/def456.jpg",
  },
  {
    id: "b4d2c3a1-8e4f-4c2b-ad3e-2f6a7b8c9d0e",
    orderId: "RC-1039",
    purchaseDate: "2026-08-23T00:00:00Z",
    purchaseAmount: 18.75,
    status: "rejected",
    submissionDate: "2026-08-24T08:05:00Z",
    approvedAt: null,
    rejectedReason:
      "Image was too blurry to confirm the total. Please retake the photo in good light and resubmit.",
    imageUrl: "/uploads/receipts/ghi789.jpg",
  },
  {
    id: "c5e3d4b2-9f5a-4d3c-be4f-3a7b8c9d0e1f",
    orderId: "RC-1035",
    purchaseDate: "2026-08-14T00:00:00Z",
    purchaseAmount: 41.02,
    status: "approved",
    submissionDate: "2026-08-15T17:22:00Z",
    approvedAt: "2026-08-16T10:05:00Z",
    rejectedReason: null,
    imageUrl: "/uploads/receipts/jkl012.jpg",
  },
  {
    id: "d6f4e5c3-0a6b-4e4d-cf5a-4b8c9d0e1f2a",
    orderId: "RC-1031",
    purchaseDate: "2026-08-02T00:00:00Z",
    purchaseAmount: 96.4,
    status: "rejected",
    submissionDate: "2026-08-03T11:58:00Z",
    approvedAt: null,
    rejectedReason: "This receipt was already submitted on 2026-08-03 as RC-1030.",
    imageUrl: "/uploads/receipts/mno345.jpg",
  },
];

export default function useReceipts() {
  const [receipts, setReceipts] = useState(DUMMY_RECEIPTS);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadReceipts() {
      try {
        const res = await fetch("/api/receipts");
        const body = await res.json();

        if (!res.ok || !body.success) {
          throw new Error(body?.error?.message || `Request failed with status ${res.status}`);
        }

        if (!cancelled) {
          setReceipts(body.data.receipts);
          setStatus("ready");
        }
      } catch (err) {
        console.error("Failed to load receipts, falling back to dummy data:", err);
        if (!cancelled) setStatus("ready");
      }
    }

    loadReceipts();

    return () => {
      cancelled = true;
    };
  }, []);

  return { receipts, status };
}
