import { useEffect, useState } from "react";
import useAdminReceipts from "../hooks/useAdminReceipts";
import EmptyState from "../components/EmptyState";
import AdminReceiptsTable from "../components/AdminReceiptsTable";
import StatusFilter from "../components/StatusFilter";
import DateRangeFilter from "../components/DateRangeFilter";
import Pagination from "../components/Pagination";
import { inputClass } from "../components/FormField";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

export default function AdminReceipts() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { receipts, pagination, status: loadStatus, error, reload } = useAdminReceipts({
    statusFilter,
    dateFrom,
    dateTo,
    page,
    limit: PAGE_SIZE,
    search,
  });

  function handleStatusChange(next) {
    setStatusFilter(next);
    setPage(1);
  }

  function handleDateChange({ dateFrom: nextFrom, dateTo: nextTo }) {
    setDateFrom(nextFrom);
    setDateTo(nextTo);
    setPage(1);
  }

  const hasActiveFilter = search || statusFilter !== "all" || dateFrom || dateTo;

  const emptyState = hasActiveFilter ? (
    <EmptyState
      title="No matching receipts"
      description="Nothing matches these filters. Try widening the search, date range, or status."
    />
  ) : (
    <EmptyState title="No receipts yet" description="Nothing has been submitted yet." />
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Receipts</h1>
        <p className="mt-1 text-sm text-ink/60">Every receipt submitted, across every member.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <input
          type="search"
          placeholder="Search by order ID or member name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className={`${inputClass(false)} w-full max-w-xs`}
          aria-label="Search receipts"
        />
        <div className="flex flex-wrap items-center gap-4">
          <DateRangeFilter dateFrom={dateFrom} dateTo={dateTo} onChange={handleDateChange} />
          <StatusFilter value={statusFilter} onChange={handleStatusChange} />
        </div>
      </div>

      <AdminReceiptsTable
        receipts={receipts}
        loadStatus={loadStatus}
        error={error}
        onRetry={reload}
        emptyState={emptyState}
      />

      <Pagination
        page={pagination?.page ?? page}
        totalPages={pagination?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
