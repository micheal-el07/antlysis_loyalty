import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

const ROW_GRID = "grid grid-cols-[minmax(0,1fr)_140px_140px] items-center gap-x-6";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function VoucherTable({ vouchers, loadStatus, error, onRetry, emptyState }) {
  if (loadStatus === "loading") {
    return <LoadingState label="Loading vouchers…" />;
  }

  if (loadStatus === "error") {
    return <ErrorState description={error} onRetry={onRetry} />;
  }

  if (vouchers.length === 0) {
    return emptyState;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-120">
        <div className={`${ROW_GRID} border-b border-line pb-2 text-xs font-medium text-ink/50`}>
          <span>Receipt id</span>
          <span className="text-right">Amount</span>
          <span>Expires at</span>
        </div>

        {vouchers.map((v) => (
          <div key={v.id} className={`${ROW_GRID} border-b border-line py-3`}>
            <p className="truncate font-mono text-xs text-ink/50">{v.receipt_id}</p>
            <p className="text-right font-mono text-sm text-ink/70">${Number(v.amount).toFixed(2)}</p>
            <p className="font-mono text-sm text-ink/70">{formatDate(v.expiry_date)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
