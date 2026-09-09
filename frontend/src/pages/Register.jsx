import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import FormField, { inputClass } from "../components/FormField";
import PasswordInput from "../components/PasswordInput";
import { friendlyErrorMessage } from "../utils/friendlyError";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Enter your full name.";
    if (!form.email.trim() && !form.phoneNumber.trim()) {
      nextErrors.email = "Enter an email or phone number.";
    }
    if (!form.password || form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        password: form.password,
      });
      navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setErrors({ form: friendlyErrorMessage(err, "Couldn't create your account. Please try again.") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <p className="font-display text-2xl font-semibold tracking-tight text-ink">Antlity</p>
        <h1 className="mt-6 font-display text-3xl text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink/60">Start earning points on every receipt you upload.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <FormField label="Full name" htmlFor="name" error={errors.name}>
            <input
              id="name"
              autoComplete="name"
              className={inputClass(!!errors.name)}
              value={form.name}
              onChange={update("name")}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email}
            hint="Provide an email or a phone number below."
          >
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputClass(!!errors.email)}
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
            />
          </FormField>

          <FormField label="Phone number" htmlFor="phoneNumber">
            <input
              id="phoneNumber"
              autoComplete="tel"
              className={inputClass(false)}
              placeholder="Optional if email is provided"
              value={form.phoneNumber}
              onChange={update("phoneNumber")}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password}
            hint="At least 8 characters."
          >
            <PasswordInput
              id="password"
              autoComplete="new-password"
              className={inputClass(!!errors.password)}
              placeholder="••••••••"
              value={form.password}
              onChange={update("password")}
            />
          </FormField>

          {errors.form && <p className="text-sm text-rejected">{errors.form}</p>}

          <Button type="submit" variant="primary" disabled={submitting} className="mt-1">
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink/60">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-petrol hover:text-petrol-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
