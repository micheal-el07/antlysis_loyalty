import useDashboard from "../hooks/useDashboard";
import WelcomeBanner from "../components/WelcomeBanner";
import StatCard from "../components/StatCard";
import RecentReceipts from "../components/RecentReceipts";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function UserDashboard() {
  const { user, stats, recentReceipts, status, error, reload } = useDashboard();

  if (status === "loading") {
    return <LoadingState label="Loading your dashboard…" />;
  }

  if (status === "error") {
    return <ErrorState description={error} onRetry={reload} />;
  }

  return (
    <div className="flex flex-col gap-10">
      <WelcomeBanner name={user.name} />

      <div className="grid grid-cols-3 divide-x divide-line border border-line bg-white">
        <StatCard label="Pending Receipts" value={stats.pendingReceipts} />
        <StatCard label="Approved Receipts" value={stats.approvedReceipts} />
        <StatCard label="Available Vouchers" value={stats.availableVouchers} />
      </div>

      <RecentReceipts receipts={recentReceipts} loadStatus={status} />
    </div>
  );
}
