import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import FormField, { inputClass } from "../components/FormField";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Only honor the page the user was bounced from if it actually belongs to
  // the role that just logged in — otherwise an admin who first hit "/"
  // while logged out (a non-admin route) would get sent back to the user
  // dashboard instead of /admin.
  function resolveDestination(role) {
    const from = location.state?.from?.pathname;
    const fallback = role === "admin" ? "/admin" : "/";
    const fromMatchesRole = from && (role === "admin") === from.startsWith("/admin");
    return fromMatchesRole ? from : fallback;
  }

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
      navigate(resolveDestination(user.role), { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
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
            <PasswordInput
              id="password"
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

        <p className="mt-6 text-sm text-ink/60">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-petrol hover:text-petrol-dark">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
