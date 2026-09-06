import { Link } from "react-router-dom";
import { currentUser, receipts, vouchers } from "../data/mock";
import StatusBadge from "../components/StatusBadge";
import TicketCard from "../components/TicketCard";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";

const firstName = currentUser.name.split(" ")[0];
const recentReceipts = receipts.slice(0, 4);
const activeVouchers = vouchers.filter((v) => v.status === "active").slice(0, 2);
const tierProgressPct = Math.round(
  (currentUser.pointsBalance / (currentUser.pointsBalance + currentUser.pointsToNextTier)) * 100
);

export default function UserDashboard() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-ink">Welcome back, {firstName}</h1>
          <p className="mt-1 text-sm text-ink/60">
            Every receipt you upload earns points toward your next voucher.
          </p>
        </div>
        <Button as={Link} to="/upload" variant="brass">
          Upload a receipt
        </Button>
      </div>

      <div className="grid grid-cols-3 divide-x divide-line border border-line bg-white">
        <div className="px-6 py-5">
          <p className="text-xs font-medium text-ink/50">Points balance</p>
          <p className="mt-1 font-mono text-3xl text-ink">{currentUser.pointsBalance.toLocaleString()}</p>
        </div>
        <div className="px-6 py-5">
          <p className="text-xs font-medium text-ink/50">Membership tier</p>
          <p className="mt-1 font-display text-2xl text-ink">{currentUser.tier}</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper-dim">
            <div className="h-full rounded-full bg-brass" style={{ width: `${tierProgressPct}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-ink/50">
            {currentUser.pointsToNextTier} points to Platinum
          </p>
        </div>
        <div className="px-6 py-5">
          <p className="text-xs font-medium text-ink/50">Active vouchers</p>
          <p className="mt-1 font-mono text-3xl text-ink">
            {vouchers.filter((v) => v.status === "active").length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-8">
        <section className="col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Recent receipts</h2>
            <Link to="/history" className="text-sm font-medium text-petrol hover:text-petrol-dark">
              View all receipts
            </Link>
          </div>

          {recentReceipts.length === 0 ? (
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
            <div className="border-t border-line">
              {recentReceipts.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 border-b border-line py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{r.merchant}</p>
                    <p className="font-mono text-xs text-ink/45">{r.date}</p>
                  </div>
                  <p className="font-mono text-sm text-ink/70">${r.amount.toFixed(2)}</p>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Your vouchers</h2>
            <Link to="/vouchers" className="text-sm font-medium text-petrol hover:text-petrol-dark">
              View all
            </Link>
          </div>

          {activeVouchers.length === 0 ? (
            <EmptyState
              title="No active vouchers"
              description="Approved receipts turn into vouchers here automatically."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {activeVouchers.map((v) => (
                <TicketCard key={v.id} voucher={v} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
