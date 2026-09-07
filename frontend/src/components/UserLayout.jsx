import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/upload", label: "Upload receipt" },
  { to: "/history", label: "Receipt history" },
  { to: "/vouchers", label: "Vouchers" },
  { to: "/settings", label: "Settings" },
];

function navClass({ isActive }) {
  return `border-b-2 py-4 text-sm font-medium transition-colors ${
    isActive ? "border-petrol text-ink" : "border-transparent text-ink/55 hover:text-ink"
  }`;
}

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Link to="/" className="font-display text-xl font-semibold tracking-tight text-ink">
              Rally
            </Link>
            <nav className="flex items-center gap-7">
              {LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 py-3">
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-ink/55 hover:text-ink"
            >
              Log out
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-petrol text-xs font-medium text-paper">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
