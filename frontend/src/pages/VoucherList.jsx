import { useState } from "react";
import useVouchers from "../hooks/useVouchers";
import EmptyState from "../components/EmptyState";
import VoucherTable from "../components/VoucherTable";
import StatCard from "../components/StatCard";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 10;

export default function VoucherList() {
  const [page, setPage] = useState(1);
  const {
    vouchers,
    pagination,
    availableAmount,
    status: loadStatus,
    error,
    reload,
  } = useVouchers({ page, limit: PAGE_SIZE });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Your vouchers</h1>
        <p className="mt-1 text-sm text-ink/60">
          Approved receipts turn into vouchers here automatically.
        </p>
      </div>

      {availableAmount !== null && (
        <div className="border border-line bg-white">
          <StatCard
            label="Total value, unexpired vouchers"
            value={`$${availableAmount.toFixed(2)}`}
          />
        </div>
      )}

      <VoucherTable
        vouchers={vouchers}
        loadStatus={loadStatus}
        error={error}
        onRetry={reload}
        emptyState={
          <EmptyState
            title="No vouchers yet"
            description="Upload and get a receipt approved to earn your first voucher."
          />
        }
      />

      <Pagination
        page={pagination?.page ?? page}
        totalPages={pagination?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
