export default function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="flex items-start gap-1.5 text-sm text-rejected">
          <svg viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" fill="none">
            <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="8" cy="10.75" r="0.75" fill="currentColor" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-ink/50">{hint}</p>
      ) : null}
    </div>
  );
}

export function inputClass(hasError) {
  return `rounded-sm border bg-paper px-3 py-2 text-sm font-sans text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-petrol/30 ${
    hasError ? "border-rejected" : "border-line-strong focus:border-petrol"
  }`;
}
