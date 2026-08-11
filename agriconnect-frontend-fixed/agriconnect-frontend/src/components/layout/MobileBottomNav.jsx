import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, ShoppingCart, Package, User, LayoutDashboard } from "lucide-react";

import ROLES from "../../constants/roles";

export default function MobileBottomNav() {
  const user = useSelector((state) => state.auth.user);

  const links = user?.role === ROLES.FARMER
    ? [
        { to: "/farmer/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/farmer/products", label: "Products", icon: Package },
        { to: "/profile", label: "Profile", icon: User },
      ]
    : [
        { to: "/", label: "Home", icon: Home },
        { to: "/products", label: "Shop", icon: Package },
        { to: "/buyer/cart", label: "Cart", icon: ShoppingCart },
        { to: "/profile", label: "Profile", icon: User },
      ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-card md:hidden">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              isActive ? "text-gold-dark" : "text-ink/50"
            }`
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
