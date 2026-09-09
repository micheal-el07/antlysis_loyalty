import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import FormField, { inputClass } from "../components/FormField";
import { friendlyErrorMessage } from "../utils/friendlyError";

const STEPS = [
  { n: 1, label: "Add photo" },
  { n: 2, label: "Confirm details" },
  { n: 3, label: "Submitted" },
];

export default function ReceiptUpload() {
  const { token, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [form, setForm] = useState({ orderId: "", date: "", amount: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleFile(f) {
    if (!f) return;
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
      setErrors({ file: "That file type isn't supported. Upload a JPG, PNG, or PDF of your receipt." });
      return;
    }
    setErrors({});
    setFile(f);
  }

  function goToDetails() {
    if (!file) {
      setErrors({ file: "Add a photo of your receipt before continuing." });
      return;
    }
    setStep(2);
  }

  async function submitDetails(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!form.orderId.trim()) nextErrors.orderId = "Enter the order ID printed on the receipt.";
    if (!form.date) nextErrors.date = "Enter the date printed on the receipt.";
    const amountNum = Number(form.amount);
    if (!form.amount) {
      nextErrors.amount = "Enter the total amount from the receipt.";
    } else if (Number.isNaN(amountNum) || amountNum <= 0) {
      nextErrors.amount = "Amount must be a number greater than RM0.00.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("image", file);
      body.append("orderId", form.orderId.trim());
      body.append("purchaseDate", new Date(form.date).toISOString());
      body.append("purchaseAmount", form.amount);

      const res = await fetch("/api/v1/receipts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      // A dead/expired token is an auth problem, not a submission problem —
      // sign the user out so ProtectedRoute sends them to /login instead of
      // leaving them stuck resubmitting against a token that'll never work.
      if (res.status === 401) {
        logout();
        return;
      }

      const responseBody = await res.json();

      if (!res.ok || !responseBody.success) {
        throw new Error(responseBody?.error?.message || "Couldn't submit your receipt.");
      }

      setStep(3);
    } catch (err) {
      setErrors({ form: friendlyErrorMessage(err, "Couldn't submit your receipt. Please try again.") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Upload a receipt</h1>
        <p className="mt-1 text-sm text-ink/60">
          Submit a purchase receipt to start earning voucher.
        </p>
      </div>

      <ol className="flex items-center gap-3">
        {STEPS.map((s, i) => (
          <li key={s.n} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs ${
                  step >= s.n ? "bg-petrol text-paper" : "bg-paper-dim text-ink/40"
                }`}
              >
                {s.n}
              </span>
              <span className={`text-sm ${step >= s.n ? "text-ink" : "text-ink/40"}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <span className="h-px w-8 bg-line-strong" />}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex flex-col items-center gap-3 rounded-sm border-2 border-dashed px-8 py-14 text-center transition-colors ${
              dragActive ? "border-petrol bg-petrol-tint" : "border-line-strong bg-white"
            }`}
          >
            <svg viewBox="0 0 40 40" className="h-9 w-9 text-petrol" fill="none">
              <path
                d="M20 26V10m0 0-6 6m6-6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 26v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {file ? (
              <p className="text-sm font-medium text-ink">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-ink">
                  Drag your receipt here, or choose a file
                </p>
                <p className="text-xs text-ink/50">JPG, PNG, or PDF, up to 10MB</p>
              </>
            )}
            <label>
              <span className="mt-1 inline-block cursor-pointer rounded-sm border border-line-strong px-3 py-1.5 text-sm font-medium text-ink hover:border-ink">
                {file ? "Choose a different file" : "Choose file"}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          </div>
          {errors.file && <p className="text-sm text-rejected">{errors.file}</p>}
          <Button variant="primary" onClick={goToDetails} className="self-start">
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={submitDetails} className="flex flex-col gap-5">
          <FormField label="Order ID" htmlFor="orderId" error={errors.orderId}>
            <input
              id="orderId"
              className={inputClass(!!errors.orderId)}
              placeholder="e.g. RC-1042"
              value={form.orderId}
              onChange={(e) => setForm({ ...form, orderId: e.target.value })}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Purchase date" htmlFor="date" error={errors.date}>
              <input
                id="date"
                type="date"
                className={inputClass(!!errors.date)}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </FormField>
            <FormField label="Total amount" htmlFor="amount" error={errors.amount}>
              <input
                id="amount"
                type="number"
                step="0.01"
                className={inputClass(!!errors.amount)}
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </FormField>
          </div>
          {errors.form && <p className="text-sm text-rejected">{errors.form}</p>}
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit receipt"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={submitting}>
              Back
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="flex flex-col items-start gap-4 border border-line bg-white px-8 py-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-approved-tint text-approved">
            <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none">
              <path
                d="M3.5 8.5L6.5 11.5L12.5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="font-display text-xl text-ink">Receipt submitted</p>
            <p className="mt-1 text-sm text-ink/60">
              We'll review {form.orderId || "your receipt"} receipt and issue a voucher once validated.
            </p>
          </div>
          <div className="flex gap-3">
            <Button as={Link} to="/history" variant="outline">
              View receipt history
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setStep(1);
                setFile(null);
                setForm({ orderId: "", date: "", amount: "" });
              }}
            >
              Upload another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
