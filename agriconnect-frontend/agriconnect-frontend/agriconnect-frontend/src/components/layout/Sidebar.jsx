import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Sprout,
  CloudSun,
  BarChart3,
  Wallet,
  Video,
  Sparkles,
  Users,
  Tag,
  Landmark,
  FileText,
  Heart,
  Bell,
  Store,
  Bot,
  Settings,
  NotebookPen,
} from "lucide-react";

import ROLES from "../../constants/roles";

const MENUS = {
  [ROLES.BUYER]: [
    { to: "/buyer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Shop", icon: Store },
    { to: "/buyer/cart", label: "Cart", icon: ShoppingCart },
    { to: "/buyer/orders", label: "Orders", icon: Package },
    { to: "/buyer/wishlist", label: "Wishlist", icon: Heart },
    { to: "/buyer/coupons", label: "Coupons", icon: Tag },
    { to: "/buyer/notifications", label: "Notifications", icon: Bell },
  ],
  [ROLES.FARMER]: [
    { to: "/farmer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/farmer/products", label: "My Products", icon: Package },
    { to: "/farmer/orders", label: "Orders", icon: ShoppingCart },
    { to: "/farmer/farm-log", label: "Farm Log", icon: NotebookPen },
    { to: "/farmer/revenue", label: "Revenue", icon: Wallet },
    { to: "/farmer/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/farmer/weather", label: "Weather", icon: CloudSun },
    { to: "/farmer/smart-crop", label: "Smart Crop", icon: Sprout },
    { to: "/farmer/ai-recommendation", label: "AI Recommendation", icon: Bot },
    { to: "/farmer/upload-video", label: "Upload Video", icon: Video },
    { to: "/farmer/schemes", label: "Govt Schemes", icon: Landmark },
    { to: "/farmer/notifications", label: "Notifications", icon: Bell },
  ],
  [ROLES.ADMIN]: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { to: "/admin/coupons", label: "Coupons", icon: Tag },
    { to: "/admin/schemes", label: "Schemes", icon: Landmark },
    { to: "/admin/reports", label: "Reports", icon: FileText },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/notifications", label: "Notifications", icon: Bell },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

export default function Sidebar() {
  const user = useSelector((state) => state.auth.user);
  const items = MENUS[user?.role] || [];

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line bg-card md:block">
      <nav className="sticky top-16 flex flex-col gap-1 p-4">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-gold-light font-medium text-gold-dark"
                  : "text-ink/70 hover:bg-paper hover:text-ink"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
