export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-line pt-4">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-sm border border-line-strong px-3 py-1.5 text-sm font-medium text-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line-strong"
      >
        Previous
      </button>
      <span className="font-mono text-xs text-ink/50">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-sm border border-line-strong px-3 py-1.5 text-sm font-medium text-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line-strong"
      >
        Next
      </button>
    </div>
  );
}
