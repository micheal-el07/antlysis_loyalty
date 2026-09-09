import { Link } from "react-router-dom";
import useAdminReceipts from "../hooks/useAdminReceipts";
import useVouchers from "../hooks/useVouchers";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminDashboard() {
  const { receipts, status: loadStatus, error: loadError, reload } = useAdminReceipts();
  const { vouchers, status: vouchersStatus } = useVouchers();

  if (loadStatus === "error") {
    return <ErrorState description={loadError} onRetry={reload} />;
  }

  const pending = receipts.filter((r) => r.status === "pending");
  const approved = receipts.filter((r) => r.status === "approved");
  const rejected = receipts.filter((r) => r.status === "rejected");
  const nextInQueue = pending.slice(0, 5);

  const stats = [
    { label: "Pending review", value: pending.length },
    { label: "Approved", value: approved.length },
    { label: "Rejected", value: rejected.length },
    { label: "Issued vouchers", value: vouchersStatus === "error" ? "—" : vouchers.length },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-ink">Queue overview</h1>
        <p className="mt-1 text-sm text-ink/55">Receipts waiting on a decision, newest first.</p>
      </div>

      <div className="grid grid-cols-4 divide-x divide-line border border-line bg-white">
        {stats.map((s) => (
          <div key={s.label} className="px-5 py-4">
            <p className="text-xs font-medium text-ink/50">{s.label}</p>
            <p className="mt-1 font-mono text-2xl text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink/70">Next in queue</h2>
          <Link to="/admin/review" className="text-sm font-medium text-petrol hover:text-petrol-dark">
            Open review queue
          </Link>
        </div>

        {loadStatus === "loading" ? (
          <LoadingState label="Loading queue…" />
        ) : nextInQueue.length === 0 ? (
          <EmptyState title="Queue is clear" description="No receipts are waiting on review right now." />
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-xs font-medium text-ink/50">
                <th className="py-2 pr-4 font-medium">Receipt</th>
                <th className="py-2 pr-4 font-medium">Member</th>
                <th className="py-2 pr-4 font-medium">Submitted</th>
                <th className="py-2 pr-4 text-right font-medium">Amount</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {nextInQueue.map((r) => (
                <tr key={r.id} className="border-b border-line hover:bg-white">
                  <td className="py-2.5 pr-4 font-mono text-xs text-ink/50">{r.orderId}</td>
                  <td className="py-2.5 pr-4 text-sm text-ink">{r.uploader?.name ?? "—"}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-ink/50">
                    {formatDate(r.submissionDate)}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-sm text-ink/70">
                    ${Number(r.purchaseAmount).toFixed(2)}
                  </td>
                  <td className="py-2.5 pr-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-2.5 text-right">
                    <Link
                      to="/admin/review"
                      className="text-sm font-medium text-petrol hover:text-petrol-dark"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
