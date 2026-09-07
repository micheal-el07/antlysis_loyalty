export default function StatCard({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
      <p className="text-sm font-semibold text-ink/70">{label}</p>
      <p className="font-mono text-3xl text-ink">{value}</p>
    </div>
  );
}
