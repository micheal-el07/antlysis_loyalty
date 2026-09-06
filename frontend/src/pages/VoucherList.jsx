import { vouchers } from "../data/mock";
import TicketCard from "../components/TicketCard";
import EmptyState from "../components/EmptyState";

const SECTIONS = [
  { key: "active", label: "Active" },
  { key: "redeemed", label: "Redeemed" },
  { key: "expired", label: "Expired" },
];

export default function VoucherList() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-3xl text-ink">Your vouchers</h1>
        <p className="mt-1 text-sm text-ink/60">
          Approved receipts turn into vouchers here automatically.
        </p>
      </div>

      {vouchers.length === 0 ? (
        <EmptyState
          title="No vouchers yet"
          description="Upload and get a receipt approved to earn your first voucher."
        />
      ) : (
        SECTIONS.map((section) => {
          const items = vouchers.filter((v) => v.status === section.key);
          if (items.length === 0) return null;
          return (
            <section key={section.key} className="flex flex-col gap-4">
              <h2 className="font-display text-xl text-ink">{section.label}</h2>
              <div className="grid grid-cols-2 gap-4">
                {items.map((v) => (
                  <TicketCard key={v.id} voucher={v} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
