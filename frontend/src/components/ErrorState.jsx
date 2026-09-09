export default function ErrorState({
  title = "Couldn't load this",
  description = "Something went wrong talking to the server.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-rejected/40 bg-rejected-tint/20 px-8 py-16 text-center">
      <svg viewBox="0 0 48 48" className="h-10 w-10 text-rejected" fill="none">
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.6" />
        <path d="M24 15v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="24" cy="32.5" r="1.6" fill="currentColor" />
      </svg>
      <p className="font-display text-lg text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink/60">{description}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-sm border border-line-strong px-3 py-1.5 text-sm font-medium text-ink hover:border-ink"
        >
          Try again
        </button>
      )}
    </div>
  );
}
