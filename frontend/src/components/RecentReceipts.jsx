import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";
import ReceiptsList from "./ReceiptsList";

export default function RecentReceipts({ receipts, loadStatus, limit = 5 }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">Recent receipts</h2>
        <Link to="/history" className="text-sm font-medium text-petrol hover:text-petrol-dark">
          View all receipts
        </Link>
      </div>

      <ReceiptsList
        receipts={receipts}
        loadStatus={loadStatus}
        limit={limit}
        withDetails={false}
        emptyState={
          <EmptyState
            title="No receipts yet"
            description="Upload your first purchase to earn vouchers."
          />
        }
      />
    </section>
  );
}
