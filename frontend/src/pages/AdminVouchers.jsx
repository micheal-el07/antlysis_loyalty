import { useState } from "react";
import useVouchers from "../hooks/useVouchers";
import EmptyState from "../components/EmptyState";
import AdminVouchersTable from "../components/AdminVouchersTable";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 10;

export default function AdminVouchers() {
  const [page, setPage] = useState(1);
  const { vouchers, pagination, status: loadStatus, error, reload } = useVouchers({
    page,
    limit: PAGE_SIZE,
  });

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

      <Pagination
        page={pagination?.page ?? page}
        totalPages={pagination?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
