import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu, X, ShoppingCart, Heart, LogOut, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

import { logoutThunk } from "../../redux/thunks/authThunk";
import ROLES from "../../constants/roles";
import Logo from "../common/Logo";
import NotificationBell from "./NotificationBell";
import { MENUS } from "./Sidebar";

const ROLE_BADGE = {
  [ROLES.FARMER]: "bg-field-light text-field-dark",
  [ROLES.BUYER]: "bg-slate-light text-slate-dark",
  [ROLES.ADMIN]: "bg-gold-light text-gold-dark",
  [ROLES.SUPER_ADMIN]: "bg-gold-light text-gold-dark",
  [ROLES.BRAND]: "bg-slate-light text-slate-dark",
};

const ROLE_DASHBOARD_PATH = {
  [ROLES.FARMER]: "/farmer/dashboard",
  [ROLES.BUYER]: "/buyer/dashboard",
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.SUPER_ADMIN]: "/admin/dashboard",
  [ROLES.BRAND]: "/brand/dashboard",
};

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const cartCount = useSelector((state) => state.cart.items?.length ?? 0);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthenticated = !!token;

  const handleLogout = async () => {
    setMenuOpen(false);
    await dispatch(logoutThunk());
    toast.success("Signed out");
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/search", label: "Search" },
    { to: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo className="shrink-0" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-ink/70 transition hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-sm font-medium text-ink/70 hover:text-ink">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded bg-gold px-4 py-2 text-sm font-medium text-white transition hover:bg-gold-dark"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {user?.role === ROLES.BUYER && (
                <>
                  <Link
                    to="/buyer/wishlist"
                    aria-label="Wishlist"
                    className="text-ink/70 transition hover:text-ink"
                  >
                    <Heart size={20} />
                  </Link>
                  <Link
                    to="/buyer/cart"
                    aria-label="Cart"
                    className="relative text-ink/70 transition hover:text-ink"
                  >
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              <NotificationBell />

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium transition ${ROLE_BADGE[user?.role] || "bg-line text-ink"}`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/60 text-xs font-semibold">
                    {user?.email?.[0]?.toUpperCase() || "?"}
                  </span>
                  {user?.role}
                </button>

                {menuOpen && (
                  <div
                    onMouseLeave={() => setMenuOpen(false)}
                    className="absolute right-0 mt-2 w-48 overflow-hidden rounded border border-line bg-card shadow-md"
                  >
                    <Link
                      to={ROLE_DASHBOARD_PATH[user?.role] || "/"}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-paper"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-paper"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rust hover:bg-rust-light"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-ink"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-paper px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="rounded px-2 py-2.5 text-sm text-ink hover:bg-card"
            >
              {link.label}
            </Link>
          ))}

          <div className="my-2 border-t border-line" />

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded px-2 py-2.5 text-sm text-ink hover:bg-card"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded bg-gold px-2 py-2.5 text-center text-sm font-medium text-white"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              {user?.role === ROLES.BUYER && (
                <>
                  <Link
                    to="/buyer/cart"
                    onClick={() => setMobileOpen(false)}
                    className="rounded px-2 py-2.5 text-sm text-ink hover:bg-card"
                  >
                    Cart ({cartCount})
                  </Link>
                  <Link
                    to="/buyer/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="rounded px-2 py-2.5 text-sm text-ink hover:bg-card"
                  >
                    Wishlist
                  </Link>
                </>
              )}
              {(MENUS[user?.role] || []).map(({ section, items }) => (
                <div key={section} className="mt-1">
                  <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink/40">
                    {section}
                  </p>
                  {items.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded px-2 py-2.5 text-sm text-ink hover:bg-card"
                    >
                      <Icon size={16} className="text-ink/50" />
                      {label}
                    </Link>
                  ))}
                </div>
              ))}
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="rounded px-2 py-2.5 text-sm text-ink hover:bg-card"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="mt-1 rounded px-2 py-2.5 text-left text-sm text-rust hover:bg-rust-light"
              >
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
