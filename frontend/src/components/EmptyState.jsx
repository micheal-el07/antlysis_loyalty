export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-line px-8 py-16 text-center">
      <svg viewBox="0 0 48 48" className="h-10 w-10 text-line-strong" fill="none">
        <path
          d="M14 6h20l6 8v28a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M34 6v8h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M16 24h16M16 30h16M16 36h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <p className="font-display text-lg text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink/60">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
