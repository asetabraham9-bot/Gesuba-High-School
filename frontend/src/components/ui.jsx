import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/materials", label: "Materials" },
  { to: "/contact", label: "Contact" }
];

export function PublicLayout() {
  const { user, isAuthenticated, dashboardPath, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-brand-100/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="Gesuba"
              className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-100"
            />
            <div className="leading-tight">
              <p className="font-display text-lg font-bold text-brand-900">
                Gesuba
              </p>
              <p className="text-xs text-brand-600">
                General Secondary School
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-brand-50 text-brand-800"
                      : "text-brand-700 hover:bg-brand-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} className="btn-secondary text-xs sm:text-sm">
                  {user?.full_name || user?.name || "Dashboard"}
                </Link>
                <button type="button" onClick={logout} className="btn-primary text-xs sm:text-sm">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-xs sm:text-sm">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary text-xs sm:text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-brand-100 bg-brand-950 text-brand-100">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-xl font-semibold text-white">
              Gesuba GSS
            </p>
            <p className="mt-2 text-sm text-brand-200">
              Learning, assessment, and school operations in one place.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-white">Quick links</p>
            <div className="mt-2 flex flex-col gap-1 text-brand-200">
              <Link to="/about" className="hover:text-white">
                About
              </Link>
              <Link to="/materials" className="hover:text-white">
                Study materials
              </Link>
              <Link to="/login" className="hover:text-white">
                Portal login
              </Link>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-white">Contact</p>
            <p className="mt-2 text-brand-200">Gesuba, Ethiopia</p>
            <p className="text-brand-200">info@gesuba.edu.et</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function DashboardShell({ title, navItems }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-page-mesh">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="card sticky top-4 space-y-4">
            <div>
              <Link to="/" className="font-display text-xl font-bold text-brand-900">
                Gesuba Portal
              </Link>
              <p className="mt-1 text-sm text-brand-600">{title}</p>
            </div>
            <div className="rounded-xl bg-brand-50 px-3 py-2 text-sm">
              <p className="font-semibold text-brand-900">
                {user?.full_name || user?.name || user?.email}
              </p>
              <p className="text-brand-600">{user?.role}</p>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-brand-700 text-white"
                        : "text-brand-800 hover:bg-brand-50"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button type="button" onClick={logout} className="btn-secondary w-full">
              Log out
            </button>
          </div>
        </aside>
        <section className="min-w-0 flex-1">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="section-title">{title}</h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-brand-600">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Alert({ tone = "error", children }) {
  const tones = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-brand-200 bg-brand-50 text-brand-800"
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="card text-center">
      <p className="font-semibold text-brand-900">{title}</p>
      {hint ? <p className="mt-1 text-sm text-brand-600">{hint}</p> : null}
    </div>
  );
}

export function StatusPill({ children, tone = "neutral" }) {
  const map = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-900",
    danger: "bg-red-100 text-red-800",
    info: "bg-brand-100 text-brand-800"
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function examStatusTone(status) {
  const s = String(status || "").toUpperCase();
  if (["APPROVED", "RELEASED", "COMPLETED", "PUBLISHED"].includes(s))
    return "success";
  if (["PENDING_APPROVAL", "SCHEDULED", "DRAFT"].includes(s)) return "warning";
  if (["REJECTED", "REVOKED"].includes(s)) return "danger";
  return "info";
}
