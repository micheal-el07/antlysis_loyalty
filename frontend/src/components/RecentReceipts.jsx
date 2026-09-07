import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";

const ROW_GRID = "grid grid-cols-[minmax(0,1fr)_120px_100px_120px] items-center gap-x-6";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function RecentReceipts({ receipts, loadStatus, limit = 5 }) {
  const recentReceipts = receipts.slice(0, limit);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">Recent receipts</h2>
        <Link to="/history" className="text-sm font-medium text-petrol hover:text-petrol-dark">
          View all receipts
        </Link>
      </div>

      {loadStatus === "loading" ? (
        <LoadingState label="Loading receipts…" />
      ) : recentReceipts.length === 0 ? (
        <EmptyState title="No receipts yet" description="Upload your first purchase to earn vouchers." />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-130">
            <div className={`${ROW_GRID} border-b border-line pb-2 text-xs font-medium text-ink/50`}>
              <span>Order id</span>
              <span>Submitted</span>
              <span className="text-right">Amount</span>
              <span>Status</span>
            </div>

            {recentReceipts.map((r) => (
              <div key={r.id} className={`${ROW_GRID} border-b border-line py-3`}>
                <p className="truncate font-mono text-xs text-ink/50">{r.orderId}</p>
                <p className="font-mono text-sm text-ink/70">{formatDate(r.submissionDate)}</p>
                <p className="text-right font-mono text-sm text-ink/70">${r.purchaseAmount.toFixed(2)}</p>
                <div>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
