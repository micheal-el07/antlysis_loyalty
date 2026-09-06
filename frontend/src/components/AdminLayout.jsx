import { NavLink, Outlet, Link } from "react-router-dom";
import { adminStats } from "../data/mock";

const LINKS = [
  { to: "/admin", label: "Queue", end: true },
  { to: "/admin/review", label: "Review" },
];

function navClass({ isActive }) {
  return `rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? "bg-petrol text-paper" : "text-paper/60 hover:text-paper"
  }`;
}

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-ink">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-display text-lg font-semibold text-paper">
              Rally <span className="font-sans text-sm font-normal text-paper/50">admin</span>
            </Link>
            <nav className="flex items-center gap-1">
              {LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs text-paper/70">
            <span>{adminStats.pendingCount} pending</span>
            <span className="text-paper/30">/</span>
            <span>{adminStats.avgReviewMinutes}m avg review</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-6 py-8">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-[1240px] px-6 py-10 text-xs text-ink/40">
        <Link to="/" className="hover:text-ink/70">
          Switch to user view
        </Link>
      </footer>
    </div>
  );
}
