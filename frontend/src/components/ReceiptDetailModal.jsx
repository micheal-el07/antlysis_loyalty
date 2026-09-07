import Modal from "./Modal";
import StatusBadge from "./StatusBadge";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ReceiptDetailModal({ receipt, onClose }) {
  return (
    <Modal onClose={onClose} className={receipt.imageUrl ? "max-w-3xl" : "max-w-md"}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-xl text-ink">Receipt details</h3>
        <button onClick={onClose} aria-label="Close" className="text-ink/40 hover:text-ink">
          ✕
        </button>
      </div>

      <div className={`mt-5 ${receipt.imageUrl ? "grid grid-cols-2 gap-6" : ""}`}>
        {receipt.imageUrl && (
          <div className="overflow-hidden rounded-sm border border-line bg-paper-dim">
            <img
              src={receipt.imageUrl}
              alt={`Receipt ${receipt.orderId}`}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-ink/50">Order id</dt>
            <dd className="font-mono text-ink">{receipt.orderId}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink/50">Amount</dt>
            <dd className="font-mono text-ink">${receipt.purchaseAmount.toFixed(2)}</dd>
          </div>
          {receipt.purchaseDate && (
            <div className="flex items-center justify-between">
              <dt className="text-ink/50">Purchased</dt>
              <dd className="font-mono text-ink">{formatDate(receipt.purchaseDate)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="text-ink/50">Submitted</dt>
            <dd className="font-mono text-ink">{formatDate(receipt.submissionDate)}</dd>
          </div>
          {receipt.approvedAt && (
            <div className="flex items-center justify-between">
              <dt className="text-ink/50">Approved</dt>
              <dd className="font-mono text-ink">{formatDate(receipt.approvedAt)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="text-ink/50">Status</dt>
            <dd>
              <StatusBadge status={receipt.status} />
            </dd>
          </div>
          {receipt.rejectedReason && (
            <div className="border-t border-line pt-3">
              <dt className="text-ink/50">Reason</dt>
              <dd className="mt-1 text-ink/80">{receipt.rejectedReason}</dd>
            </div>
          )}
        </dl>
      </div>
    </Modal>
  );
}
