const VARIANTS = {
  primary: "bg-petrol text-paper hover:bg-petrol-dark",
  brass: "bg-brass text-ink hover:bg-brass-dark hover:text-paper",
  outline: "border border-line-strong text-ink hover:border-ink bg-transparent",
  approve: "bg-approved text-white hover:brightness-95",
  reject: "border border-rejected text-rejected hover:bg-rejected hover:text-white",
  ghost: "text-ink hover:bg-paper-dim",
};

export default function Button({
  variant = "primary",
  className = "",
  as: Component = "button",
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-medium font-sans transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
