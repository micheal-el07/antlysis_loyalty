import { useState } from "react";
import { Link } from "react-router-dom";
import useReceipts from "../hooks/useReceipts";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ReceiptHistoryTable from "../components/ReceiptHistoryTable";

const FILTERS = ["All", "Pending", "Approved", "Rejected"];

export default function ReceiptHistory() {
  const { receipts, status: loadStatus, error, reload } = useReceipts();
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All" ? receipts : receipts.filter((r) => r.status === filter.toLowerCase());

  const emptyState =
    receipts.length === 0 ? (
      <EmptyState
        title="No receipts yet"
        description="Upload your first purchase to start earning points."
        action={
          <Button as={Link} to="/upload" variant="primary">
            Upload a receipt
          </Button>
        }
      />
    ) : (
      <EmptyState
        title={`No ${filter.toLowerCase()} receipts`}
        description="Nothing here right now. Try a different filter."
      />
    );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Receipt history</h1>
        <p className="mt-1 text-sm text-ink/60">Every receipt you've submitted and its outcome.</p>
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

      <ReceiptHistoryTable
        receipts={filtered}
        loadStatus={loadStatus}
        error={error}
        onRetry={reload}
        emptyState={emptyState}
      />
    </div>
  );
}
