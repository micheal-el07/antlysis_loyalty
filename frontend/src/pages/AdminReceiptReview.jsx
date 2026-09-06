import { useState } from "react";
import { adminQueue as initialQueue } from "../data/mock";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";

const REJECT_REASONS = [
  "Image too blurry to read",
  "Total doesn't match the amount entered",
  "Duplicate of a previous submission",
  "Receipt is from a non-participating merchant",
];

export default function AdminReceiptReview() {
  const [queue, setQueue] = useState(initialQueue);
  const [selectedId, setSelectedId] = useState(initialQueue[0]?.id ?? null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [decisions, setDecisions] = useState([]);

  const selected = queue.find((r) => r.id === selectedId) ?? null;

  function resolve(id, status, reasonText) {
    const item = queue.find((r) => r.id === id);
    setQueue((q) => q.filter((r) => r.id !== id));
    setDecisions((d) => [{ ...item, status, reason: reasonText }, ...d]);
    setRejecting(false);
    setReason("");
    setError("");
    const remaining = queue.filter((r) => r.id !== id);
    setSelectedId(remaining[0]?.id ?? null);
  }

  function handleReject() {
    if (!reason.trim()) {
      setError("Add a reason so the member knows what to fix.");
      return;
    }
    resolve(selected.id, "REJECTED", reason.trim());
  }

  return (
    <div className="grid grid-cols-5 gap-6">
      <div className="col-span-2 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-ink">Review queue</h1>
          <span className="font-mono text-sm text-ink/50">{queue.length} left</span>
        </div>

        {queue.length === 0 ? (
          <EmptyState title="Queue is clear" description="Every receipt has been reviewed. Nice work." />
        ) : (
          <ul className="flex flex-col border-t border-line">
            {queue.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => {
                    setSelectedId(r.id);
                    setRejecting(false);
                    setReason("");
                    setError("");
                  }}
                  className={`flex w-full items-center justify-between gap-3 border-b border-line px-2 py-3 text-left transition-colors ${
                    r.id === selectedId ? "bg-petrol-tint" : "hover:bg-white"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{r.user}</p>
                    <p className="truncate text-xs text-ink/50">{r.merchant}</p>
                  </div>
                  <p className="flex-shrink-0 font-mono text-sm text-ink/70">${r.amount.toFixed(2)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {decisions.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
            <h2 className="text-xs font-medium text-ink/50">Decided this session</h2>
            {decisions.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-xs">
                <span className="text-ink/70">
                  {d.merchant} <span className="text-ink/40">({d.user})</span>
                </span>
                <span className={d.status === "APPROVED" ? "text-approved" : "text-rejected"}>
                  {d.status === "APPROVED" ? "Approved" : "Rejected"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-3">
        {!selected ? (
          <div className="flex h-full items-center justify-center border border-line bg-white px-8 py-20">
            <p className="text-sm text-ink/50">Select a receipt from the queue to review it.</p>
          </div>
        ) : (
          <div className="border border-line bg-white">
            <div className="flex items-center justify-center border-b border-line bg-paper-dim py-16">
              <div className="flex flex-col items-center gap-2 text-ink/35">
                <svg viewBox="0 0 40 52" className="h-16 w-14" fill="none">
                  <path
                    d="M4 2h32v46l-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3V2Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path d="M11 13h18M11 20h18M11 27h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <p className="text-xs">Receipt image preview</p>
              </div>
            </div>

            <div className="flex flex-col gap-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Member" value={selected.user} />
                <Field label="Receipt ID" value={selected.id} mono />
                <Field label="Merchant" value={selected.merchant} />
                <Field label="Purchase date" value={selected.date} mono />
                <Field label="Amount" value={`$${selected.amount.toFixed(2)}`} mono />
                <Field label="Submitted" value={new Date(selected.submittedAt).toLocaleString()} mono />
              </div>

              {!rejecting ? (
                <div className="flex items-center gap-3 border-t border-line pt-5">
                  <Button variant="approve" onClick={() => resolve(selected.id, "APPROVED")}>
                    Approve
                  </Button>
                  <Button variant="reject" onClick={() => setRejecting(true)}>
                    Reject
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 border-t border-line pt-5">
                  <label className="text-sm font-medium text-ink">Reason for rejection</label>
                  <div className="flex flex-wrap gap-2">
                    {REJECT_REASONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReason(r)}
                        className={`rounded-sm border px-2.5 py-1 text-xs transition-colors ${
                          reason === r
                            ? "border-petrol bg-petrol-tint text-ink"
                            : "border-line-strong text-ink/60 hover:border-ink"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="min-h-20 rounded-sm border border-line-strong bg-paper px-3 py-2 text-sm focus:border-petrol focus:outline-none focus:ring-2 focus:ring-petrol/30"
                    placeholder="Explain what the member needs to fix..."
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      setError("");
                    }}
                  />
                  {error && <p className="text-sm text-rejected">{error}</p>}
                  <div className="flex items-center gap-3">
                    <Button variant="reject" onClick={handleReject}>
                      Confirm rejection
                    </Button>
                    <Button variant="ghost" onClick={() => setRejecting(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink/50">{label}</p>
      <p className={`mt-0.5 text-sm text-ink ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
