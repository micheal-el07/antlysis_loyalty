import { useState } from "react";
import useAdminReceipts from "../hooks/useAdminReceipts";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { friendlyErrorMessage } from "../utils/friendlyError";

const REJECT_REASONS = [
  "Image too blurry to read",
  "Total doesn't match the amount entered",
  "Duplicate of a previous submission",
  "Receipt is from a non-participating merchant",
];

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminReceiptReview() {
  const {
    receipts,
    status: loadStatus,
    error: loadError,
    reload,
    updateReceiptStatus,
  } = useAdminReceipts();
  const queue = receipts.filter((r) => r.status === "pending");

  const [selectedId, setSelectedId] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [decisions, setDecisions] = useState([]);

  const selected = queue.find((r) => r.id === selectedId) ?? queue[0] ?? null;

  function selectReceipt(id) {
    setSelectedId(id);
    setRejecting(false);
    setReason("");
    setError("");
  }

  async function handleApprove() {
    if (!selected || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await updateReceiptStatus(selected.id, { status: "approved" });
      setDecisions((d) => [{ ...selected, status: "approved" }, ...d]);
      setSelectedId(null);
    } catch (err) {
      setError(friendlyErrorMessage(err, "Couldn't save that decision. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      setError("Add a reason so the member knows what to fix.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await updateReceiptStatus(selected.id, { status: "rejected", rejectedReason: reason.trim() });
      setDecisions((d) => [{ ...selected, status: "rejected", reason: reason.trim() }, ...d]);
      setRejecting(false);
      setReason("");
      setSelectedId(null);
    } catch (err) {
      setError(friendlyErrorMessage(err, "Couldn't save that decision. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadStatus === "error") {
    return <ErrorState description={loadError} onRetry={reload} />;
  }

  return (
    <div className="grid grid-cols-5 gap-6">
      <div className="col-span-2 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-ink">Review queue</h1>
          <span className="font-mono text-sm text-ink/50">{queue.length} left</span>
        </div>

        {loadStatus === "loading" ? (
          <LoadingState label="Loading queue…" />
        ) : queue.length === 0 ? (
          <EmptyState title="Queue is clear" description="Every receipt has been reviewed. Nice work." />
        ) : (
          <ul className="flex flex-col border-t border-line">
            {queue.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => selectReceipt(r.id)}
                  className={`flex w-full items-center justify-between gap-3 border-b border-line px-2 py-3 text-left transition-colors ${
                    r.id === selected?.id ? "bg-petrol-tint" : "hover:bg-white"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {r.uploader?.name ?? "Unknown member"}
                    </p>
                    <p className="truncate text-xs text-ink/50">{r.orderId}</p>
                  </div>
                  <p className="shrink-0 font-mono text-sm text-ink/70">
                    RM{Number(r.purchaseAmount).toFixed(2)}
                  </p>
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
                  {d.orderId} <span className="text-ink/40">({d.uploader?.name ?? "—"})</span>
                </span>
                <span className={d.status === "approved" ? "text-approved" : "text-rejected"}>
                  {d.status === "approved" ? "Approved" : "Rejected"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-3">
        {!selected ? (
          <div className="flex h-full items-center justify-center border border-line bg-white px-8 py-20">
            <p className="text-sm text-ink/50">
              {loadStatus === "loading" ? "Loading…" : "Select a receipt from the queue to review it."}
            </p>
          </div>
        ) : (
          <div className="border border-line bg-white">
            <div className="flex items-center justify-center border-b border-line bg-paper-dim py-16">
              {selected.imageUrl ? (
                <img
                  src={selected.imageUrl}
                  alt={`Receipt ${selected.orderId}`}
                  className="max-h-64 object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-ink/35">
                  <svg viewBox="0 0 40 52" className="h-16 w-14" fill="none">
                    <path
                      d="M4 2h32v46l-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3V2Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11 13h18M11 20h18M11 27h11"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="text-xs">Receipt image preview</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Member" value={selected.uploader?.name ?? "—"} />
                <Field label="Order ID" value={selected.orderId} mono />
                <Field label="Purchase date" value={formatDate(selected.purchaseDate)} mono />
                <Field label="Amount (RM)" value={Number(selected.purchaseAmount).toFixed(2)} mono />
                <Field label="Submitted" value={formatDate(selected.submissionDate)} mono />
              </div>

              {error && <p className="text-sm text-rejected">{error}</p>}

              {!rejecting ? (
                <div className="flex items-center gap-3 border-t border-line pt-5">
                  <Button variant="approve" onClick={handleApprove} disabled={submitting}>
                    {submitting ? "Approving…" : "Approve"}
                  </Button>
                  <Button variant="reject" onClick={() => setRejecting(true)} disabled={submitting}>
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
                  <div className="flex items-center gap-3">
                    <Button variant="reject" onClick={handleReject} disabled={submitting}>
                      {submitting ? "Rejecting…" : "Confirm rejection"}
                    </Button>
                    <Button variant="ghost" onClick={() => setRejecting(false)} disabled={submitting}>
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
