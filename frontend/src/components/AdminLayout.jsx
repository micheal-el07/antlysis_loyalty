import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useAdminReceipts from "../hooks/useAdminReceipts";

const LINKS = [
  { to: "/admin", label: "Queue", end: true },
  { to: "/admin/receipts", label: "Receipts" },
  { to: "/admin/vouchers", label: "Vouchers" },
  { to: "/admin/review", label: "Review" },
];

function navClass({ isActive }) {
  return `rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? "bg-petrol text-paper" : "text-paper/60 hover:text-paper"
  }`;
}

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { receipts, status: receiptsStatus } = useAdminReceipts();
  const pendingCount =
    receiptsStatus === "error" ? "—" : receipts.filter((r) => r.status === "pending").length;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-ink">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-display text-lg font-semibold text-paper">
              Antlity <span className="font-sans text-sm font-normal text-paper/50">admin</span>
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
            <span>{pendingCount} pending</span>
            <span className="text-paper/30">/</span>
            <button onClick={handleLogout} className="font-sans text-paper/70 hover:text-paper">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
