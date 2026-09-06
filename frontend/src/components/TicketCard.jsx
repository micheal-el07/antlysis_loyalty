const STATUS_LABEL = {
  active: "Active",
  redeemed: "Redeemed",
  expired: "Expired",
};

export default function TicketCard({ voucher }) {
  const dimmed = voucher.status !== "active";

  return (
    <div
      className={`flex overflow-hidden rounded-sm border border-line bg-white ${
        dimmed ? "opacity-55" : ""
      }`}
    >
      <div className="flex flex-1 flex-col gap-1 p-5">
        <p className="font-display text-lg leading-snug text-ink">{voucher.title}</p>
        <p className="text-sm text-ink/60">{voucher.description}</p>
        <p className="mt-3 text-xs text-ink/50">
          {voucher.status === "active"
            ? `Expires ${voucher.expiresAt}`
            : voucher.status === "redeemed"
            ? `Redeemed, expired ${voucher.expiresAt}`
            : `Expired ${voucher.expiresAt}`}
        </p>
      </div>

      <div className="ticket-stub flex w-36 flex-shrink-0 flex-col items-center justify-center gap-2 bg-brass-tint px-4 py-5">
        <p className="font-display text-xl font-medium text-brass-dark">{voucher.value}</p>
        <p className="rounded-sm bg-white px-2 py-1 font-mono text-[11px] tracking-tight text-ink/70">
          {voucher.code}
        </p>
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink/40">
          {STATUS_LABEL[voucher.status]}
        </span>
      </div>
    </div>
  );
}
