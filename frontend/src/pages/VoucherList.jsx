import useVouchers from "../hooks/useVouchers";
import EmptyState from "../components/EmptyState";
import VoucherTable from "../components/VoucherTable";

export default function VoucherList() {
  const { vouchers, status: loadStatus } = useVouchers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Your vouchers</h1>
        <p className="mt-1 text-sm text-ink/60">
          Approved receipts turn into vouchers here automatically.
        </p>
      </div>

      <VoucherTable
        vouchers={vouchers}
        loadStatus={loadStatus}
        emptyState={
          <EmptyState
            title="No vouchers yet"
            description="Upload and get a receipt approved to earn your first voucher."
          />
        }
      />
    </div>
  );
}
