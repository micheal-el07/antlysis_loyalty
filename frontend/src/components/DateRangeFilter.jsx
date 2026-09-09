import { inputClass } from "./FormField";

export default function DateRangeFilter({ dateFrom, dateTo, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onChange({ dateFrom: e.target.value, dateTo })}
        aria-label="Purchased from"
        className={`${inputClass(false)} w-auto`}
      />
      <span className="text-sm text-ink/40">to</span>
      <input
        type="date"
        value={dateTo}
        min={dateFrom || undefined}
        onChange={(e) => onChange({ dateFrom, dateTo: e.target.value })}
        aria-label="Purchased to"
        className={`${inputClass(false)} w-auto`}
      />
      {(dateFrom || dateTo) && (
        <button
          type="button"
          onClick={() => onChange({ dateFrom: "", dateTo: "" })}
          className="text-sm font-medium text-ink/50 hover:text-ink"
        >
          Clear
        </button>
      )}
    </div>
  );
}
