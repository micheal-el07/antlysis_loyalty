import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import FormField, { inputClass } from "../components/FormField";

export default function Login() {
  const { login, devLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const nextErrors = {};
    if (!identifier.trim()) nextErrors.identifier = "Enter your email or phone number.";
    if (!password) nextErrors.password = "Enter your password.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const user = await login(identifier.trim(), password);
      const fallback = user.role === "admin" ? "/admin" : "/";
      navigate(location.state?.from?.pathname ?? fallback, { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  function handleDevLogin(role) {
    devLogin(role);
    navigate(location.state?.from?.pathname ?? (role === "admin" ? "/admin" : "/"), {
      replace: true,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <p className="font-display text-2xl font-semibold tracking-tight text-ink">Rally</p>
        <h1 className="mt-6 font-display text-3xl text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink/60">Enter your details to access your account.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <FormField label="Email or phone" htmlFor="identifier" error={errors.identifier}>
            <input
              id="identifier"
              autoComplete="username"
              className={inputClass(!!errors.identifier)}
              placeholder="you@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password}>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={inputClass(!!errors.password)}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>

          {errors.form && <p className="text-sm text-rejected">{errors.form}</p>}

          <Button type="submit" variant="primary" disabled={submitting} className="mt-1">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-8 border-t border-line pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
              Dev shortcuts — no backend needed
            </p>
            <div className="mt-3 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleDevLogin("user")}
              >
                Continue as user
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleDevLogin("admin")}
              >
                Continue as admin
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
