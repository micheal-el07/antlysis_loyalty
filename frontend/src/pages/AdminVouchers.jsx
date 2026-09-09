import useVouchers from "../hooks/useVouchers";
import EmptyState from "../components/EmptyState";
import AdminVouchersTable from "../components/AdminVouchersTable";

export default function AdminVouchers() {
  const { vouchers, status: loadStatus, error, reload } = useVouchers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Vouchers</h1>
        <p className="mt-1 text-sm text-ink/60">Every voucher issued, across every member.</p>
      </div>

      <AdminVouchersTable
        vouchers={vouchers}
        loadStatus={loadStatus}
        error={error}
        onRetry={reload}
        emptyState={
          <EmptyState
            title="No vouchers issued yet"
            description="Vouchers appear here as soon as a receipt is approved."
          />
        }
      />
    </div>
  );
}
