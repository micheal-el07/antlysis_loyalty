import { useState } from "react";
import { currentUser } from "../data/mock";
import Button from "../components/Button";
import FormField, { inputClass } from "../components/FormField";

export default function AccountSettings() {
  const [form, setForm] = useState({ name: currentUser.name, email: currentUser.email });
  const [notifications, setNotifications] = useState({
    receiptDecisions: true,
    voucherExpiry: true,
    promotions: false,
  });
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <div>
        <h1 className="font-display text-3xl text-ink">Account settings</h1>
        <p className="mt-1 text-sm text-ink/60">Manage your profile and notification preferences.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-10">
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-lg text-ink">Profile</h2>
          <FormField label="Full name" htmlFor="name">
            <input
              id="name"
              className={inputClass(false)}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label="Email address" htmlFor="email" hint="Used for receipt decisions and voucher alerts.">
            <input
              id="email"
              type="email"
              className={inputClass(false)}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-8">
          <h2 className="font-display text-lg text-ink">Notifications</h2>
          {[
            {
              key: "receiptDecisions",
              label: "Receipt decisions",
              hint: "Get notified when a receipt is approved or rejected.",
            },
            {
              key: "voucherExpiry",
              label: "Voucher expiry reminders",
              hint: "A heads-up a few days before an unused voucher expires.",
            },
            {
              key: "promotions",
              label: "Promotions and bonus point events",
              hint: "Occasional emails about ways to earn extra points.",
            },
          ].map((item) => (
            <label key={item.key} className="flex items-start gap-3 py-1">
              <input
                type="checkbox"
                checked={notifications[item.key]}
                onChange={(e) =>
                  setNotifications({ ...notifications, [item.key]: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 accent-petrol"
              />
              <span>
                <span className="block text-sm font-medium text-ink">{item.label}</span>
                <span className="block text-xs text-ink/50">{item.hint}</span>
              </span>
            </label>
          ))}
        </section>

        <div className="flex items-center gap-3 border-t border-line pt-8">
          <Button type="submit" variant="primary">
            Save changes
          </Button>
          {saved && <span className="text-sm text-approved">Changes saved.</span>}
        </div>
      </form>

      <section className="flex flex-col gap-3 border border-rejected/30 bg-rejected-tint/40 px-6 py-5">
        <h2 className="font-display text-lg text-ink">Delete account</h2>
        <p className="text-sm text-ink/60">
          Permanently deletes your profile, receipt history, and any unredeemed vouchers. This
          can't be undone.
        </p>
        <Button variant="reject" className="self-start">
          Delete my account
        </Button>
      </section>
    </div>
  );
}
