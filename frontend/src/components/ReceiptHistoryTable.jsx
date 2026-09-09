import { useState } from "react";
import StatusBadge from "./StatusBadge";
import ReceiptDetailModal from "./ReceiptDetailModal";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

const ROW_GRID = "grid grid-cols-[minmax(0,1fr)_120px_120px_100px_120px_40px] items-center gap-x-6";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReceiptHistoryTable({ receipts, loadStatus, error, onRetry, emptyState }) {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  if (loadStatus === "loading") {
    return <LoadingState label="Loading receipts…" />;
  }

  if (loadStatus === "error") {
    return <ErrorState description={error} onRetry={onRetry} />;
  }

  if (receipts.length === 0) {
    return emptyState;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-185">
        <div className={`${ROW_GRID} border-b border-line pb-2 text-xs font-medium text-ink/50`}>
          <span>Order id</span>
          <span>Purchase date</span>
          <span>Submitted</span>
          <span className="text-right">Amount (RM)</span>
          <span>Status</span>
          <span />
        </div>

        {receipts.map((r) => (
          <div key={r.id} className={`${ROW_GRID} border-b border-line py-3`}>
            <p className="truncate font-mono text-xs text-ink/50">{r.orderId}</p>
            <p className="font-mono text-sm text-ink/70">{formatDate(r.purchaseDate)}</p>
            <p className="font-mono text-sm text-ink/70">{formatDate(r.submissionDate)}</p>
            <p className="text-right font-mono text-sm text-ink/70">{Number(r.purchaseAmount).toFixed(2)}</p>
            <div>
              <StatusBadge status={r.status} />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedReceipt(r)}
                aria-label={`View details for ${r.orderId}`}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-xs font-medium text-ink/50 hover:border-petrol hover:text-petrol"
              >
                i
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedReceipt && (
        <ReceiptDetailModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
}
