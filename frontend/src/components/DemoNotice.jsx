import { useState } from "react";

const DISMISS_KEY = "antlity_demo_notice_dismissed";

export default function DemoNotice() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore — storage may be unavailable (private mode, blocked cookies)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-brass-tint px-4 py-2 text-sm text-ink">
      <p>
        This is a portfolio demo. Accounts are capped and data resets periodically — please don't
        rely on anything you store here.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-ink/60 hover:text-ink"
      >
        ✕
      </button>
    </div>
  );
}
