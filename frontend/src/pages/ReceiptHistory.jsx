import { useState } from "react";
import { Link } from "react-router-dom";
import { receipts } from "../data/mock";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";

const FILTERS = ["All", "Pending", "Approved", "Rejected"];

export default function ReceiptHistory() {
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All" ? receipts : receipts.filter((r) => r.status === filter.toUpperCase());

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

      {receipts.length === 0 ? (
        <EmptyState
          title="No receipts yet"
          description="Upload your first purchase to start earning points."
          action={
            <Button as={Link} to="/upload" variant="primary">
              Upload a receipt
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`No ${filter.toLowerCase()} receipts`}
          description="Nothing here right now. Try a different filter."
        />
      ) : (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-xs font-medium text-ink/50">
              <th className="py-2 pr-4 font-medium">Receipt</th>
              <th className="py-2 pr-4 font-medium">Merchant</th>
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 text-right font-medium">Amount</th>
              <th className="py-2 pr-4 text-right font-medium">Points</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-line align-top">
                <td className="py-3 pr-4 font-mono text-xs text-ink/50">{r.id}</td>
                <td className="py-3 pr-4 text-sm text-ink">
                  {r.merchant}
                  {r.status === "REJECTED" && r.reason && (
                    <p className="mt-1 max-w-sm text-xs text-rejected">{r.reason}</p>
                  )}
                </td>
                <td className="py-3 pr-4 font-mono text-sm text-ink/70">{r.date}</td>
                <td className="py-3 pr-4 text-right font-mono text-sm text-ink/70">
                  ${r.amount.toFixed(2)}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-sm text-ink/70">
                  {r.points ? `+${r.points}` : "—"}
                </td>
                <td className="py-3">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
