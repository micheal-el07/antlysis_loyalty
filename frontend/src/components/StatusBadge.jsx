const CONFIG = {
  PENDING: {
    label: "Pending",
    className: "border border-pending text-pending bg-transparent",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.2 2.2" />
        <path d="M8 4.75V8l2.25 1.35" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  APPROVED: {
    label: "Approved",
    className: "bg-approved text-white",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
        <path d="M3.5 8.5L6.5 11.5L12.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rejected text-white",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
        <path d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
};

export default function StatusBadge({ status, className = "" }) {
  const config = CONFIG[status];
  if (!config) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium font-sans ${config.className} ${className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
