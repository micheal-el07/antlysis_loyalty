const CONFIG = {
  pending: {
    label: "Pending",
    className: "bg-pending-tint text-pending",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.2 2.2" />
        <path d="M8 4.75V8l2.25 1.35" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  approved: {
    label: "Approved",
    className: "bg-approved-tint text-approved",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
        <path d="M3.5 8.5L6.5 11.5L12.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  rejected: {
    label: "Rejected",
    className: "bg-rejected-tint text-rejected",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
        <path d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
};

export default function StatusBadge({ status, className = "" }) {
  const config = CONFIG[status?.toLowerCase()];
  if (!config) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold font-sans ${config.className} ${className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
