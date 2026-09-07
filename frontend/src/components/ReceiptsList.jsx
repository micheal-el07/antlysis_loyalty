import { useState } from "react";
import StatusBadge from "./StatusBadge";
import ReceiptDetailModal from "./ReceiptDetailModal";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getRowGrid(showPurchaseDate, withDetails) {
  if (showPurchaseDate && withDetails) {
    return "grid grid-cols-[1fr_140px_120px_120px_100px_120px_40px] items-center gap-x-6";
  }
  if (showPurchaseDate && !withDetails) {
    return "grid grid-cols-[1fr_140px_120px_120px_100px_120px] items-center gap-x-6";
  }
  if (!showPurchaseDate && withDetails) {
    return "grid grid-cols-[1fr_140px_120px_100px_120px_40px] items-center gap-x-6";
  }
  return "grid grid-cols-[1fr_140px_120px_100px_120px] items-center gap-x-6";
}

export default function ReceiptsList({
  receipts,
  loadStatus,
  limit,
  showPurchaseDate = false,
  withDetails = true,
  emptyState,
}) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const rows = limit ? receipts.slice(0, limit) : receipts;
  const rowGrid = getRowGrid(showPurchaseDate, withDetails);

  if (loadStatus === "loading") {
    return <p className="py-6 text-sm text-ink/50">Loading receipts…</p>;
  }

  if (rows.length === 0) {
    return emptyState;
  }

  return (
    <div>
      <div className={`${rowGrid} border-b border-line pb-2 text-xs font-medium text-ink/50`}>
        <span>Receipt</span>
        <span>Order id</span>
        {showPurchaseDate && <span>Purchase date</span>}
        <span>Submitted</span>
        <span className="text-right">Amount</span>
        <span>Status</span>
        {withDetails && <span />}
      </div>

      {rows.map((r) => (
        <div key={r.id} className={`${rowGrid} border-b border-line py-3`}>
          <p className="font-mono text-xs text-ink/50">{r.id}</p>
          <p className="font-mono text-xs text-ink/50">{r.orderId}</p>
          {showPurchaseDate && (
            <p className="font-mono text-sm text-ink/70">{formatDate(r.purchaseDate)}</p>
          )}
          <p className="font-mono text-sm text-ink/70">{formatDate(r.submissionDate)}</p>
          <p className="text-right font-mono text-sm text-ink/70">${r.purchaseAmount.toFixed(2)}</p>
          <div>
            <StatusBadge status={r.status} />
          </div>
          {withDetails && (
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedReceipt(r)}
                aria-label={`View details for ${r.orderId}`}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-xs font-medium text-ink/50 hover:border-petrol hover:text-petrol"
              >
                i
              </button>
            </div>
          )}
        </div>
      ))}

      {withDetails && selectedReceipt && (
        <ReceiptDetailModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
}
