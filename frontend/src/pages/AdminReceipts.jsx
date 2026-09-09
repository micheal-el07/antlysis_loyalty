import { useState } from "react";
import useAdminReceipts from "../hooks/useAdminReceipts";
import EmptyState from "../components/EmptyState";
import AdminReceiptsTable from "../components/AdminReceiptsTable";

const FILTERS = ["All", "Pending", "Approved", "Rejected"];

export default function AdminReceipts() {
  const { receipts, status: loadStatus, error, reload } = useAdminReceipts();
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All" ? receipts : receipts.filter((r) => r.status === filter.toLowerCase());

  const emptyState =
    receipts.length === 0 ? (
      <EmptyState title="No receipts yet" description="Nothing has been submitted yet." />
    ) : (
      <EmptyState
        title={`No ${filter.toLowerCase()} receipts`}
        description="Nothing here right now. Try a different filter."
      />
    );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Receipts</h1>
        <p className="mt-1 text-sm text-ink/60">Every receipt submitted, across every member.</p>
      </div>

      <div className="flex items-center gap-1 border-b border-line">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? "border-petrol text-ink"
                : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <AdminReceiptsTable
        receipts={filtered}
        loadStatus={loadStatus}
        error={error}
        onRetry={reload}
        emptyState={emptyState}
      />
    </div>
  );
}
