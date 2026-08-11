import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Users, Package, ShoppingBag } from "lucide-react";

import { fetchUsersThunk, fetchAdminProductsThunk, fetchAdminOrdersThunk } from "../../redux/thunks/adminThunk";
import PageHeader from "../../components/common/PageHeader";
import DashboardCard from "../../components/cards/DashboardCard";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { users, products, orders } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchUsersThunk());
    dispatch(fetchAdminProductsThunk());
    dispatch(fetchAdminOrdersThunk());
  }, [dispatch]);

  return (
    <div>
      <PageHeader title="Admin dashboard" subtitle="Platform overview." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/admin/users">
          <DashboardCard title="Users" value={users.length} icon={Users} tone="slate" />
        </Link>
        <Link to="/admin/products">
          <DashboardCard title="Products" value={products.length} icon={Package} tone="field" />
        </Link>
        <Link to="/admin/orders">
          <DashboardCard title="Orders" value={orders.length} icon={ShoppingBag} tone="gold" />
        </Link>
      </div>
    </div>
  );
}
