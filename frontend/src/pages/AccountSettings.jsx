import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import FormField, { inputClass } from "../components/FormField";
import LoadingState from "../components/LoadingState";
import { friendlyErrorMessage } from "../utils/friendlyError";

const NOTIFICATION_OPTIONS = [
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
];

export default function AccountSettings() {
  const { token, user, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: "", phoneNumber: "" });
  const [loadStatus, setLoadStatus] = useState("loading");
  const [notifications, setNotifications] = useState({
    receiptDecisions: true,
    voucherExpiry: true,
    promotions: false,
  });
  const [saveStatus, setSaveStatus] = useState("idle");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const res = await fetch("/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // A dead/expired token is an auth problem, not a "couldn't load
        // profile" problem — sign the user out so ProtectedRoute sends them
        // to /login instead of showing a form that can never load or save.
        if (res.status === 401) {
          if (!cancelled) logout();
          return;
        }

        const body = await res.json();

        if (!res.ok || !body.success) {
          throw new Error(body?.error?.message || `Request failed with status ${res.status}`);
        }

        if (!cancelled) {
          setForm({
            name: body.data.name || "",
            email: body.data.email || "",
            phoneNumber: body.data.phoneNumber || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        if (!cancelled) setLoadStatus("ready");
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSave(e) {
    e.preventDefault();
    setErrors({});
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/v1/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email || null,
          phoneNumber: form.phoneNumber || null,
        }),
      });

      // A dead/expired token is an auth problem, not a "couldn't save"
      // problem — sign the user out so ProtectedRoute sends them to /login
      // instead of leaving them stuck resaving against a dead token.
      if (res.status === 401) {
        logout();
        return;
      }

      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body?.error?.message || "Couldn't save your changes.");
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      setErrors({ form: friendlyErrorMessage(err, "Couldn't save your changes.") });
      setSaveStatus("error");
    }
  }

  if (loadStatus === "loading") {
    return <LoadingState label="Loading your account…" />;
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
          <FormField
            label="Email address"
            htmlFor="email"
            hint="Used for receipt decisions and voucher alerts."
          >
            <input
              id="email"
              type="email"
              className={inputClass(false)}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
          <FormField label="Phone number" htmlFor="phoneNumber">
            <input
              id="phoneNumber"
              className={inputClass(false)}
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            />
          </FormField>
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-8">
          <h2 className="font-display text-lg text-ink">Notifications</h2>
          {NOTIFICATION_OPTIONS.map((item) => (
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

        {errors.form && <p className="text-sm text-rejected">{errors.form}</p>}

        <div className="flex items-center gap-3 border-t border-line pt-8">
          <Button type="submit" variant="primary" disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? "Saving…" : "Save changes"}
          </Button>
          {saveStatus === "saved" && <span className="text-sm text-approved">Changes saved.</span>}
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
