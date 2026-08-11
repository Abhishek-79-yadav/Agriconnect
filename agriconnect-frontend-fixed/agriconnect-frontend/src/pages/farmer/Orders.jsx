import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { fetchOrdersThunk, updateOrderStatusThunk } from "../../redux/thunks/orderThunk";
import OrderCard from "../../components/cards/OrderCard";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

// What a farmer can move an order to, given its current status. Terminal
// states (DELIVERED / CANCELLED) show no actions — the backend rejects
// changes to those anyway.
const NEXT_ACTIONS = {
  PENDING: [{ status: "CONFIRMED", label: "Confirm order", variant: "primary" }],
  CONFIRMED: [{ status: "SHIPPED", label: "Mark shipped", variant: "primary" }],
  SHIPPED: [{ status: "OUT_FOR_DELIVERY", label: "Out for delivery", variant: "primary" }],
  OUT_FOR_DELIVERY: [{ status: "DELIVERED", label: "Mark delivered", variant: "primary" }],
};

export default function Orders() {
  const dispatch = useDispatch();
  const { orders: rawOrders, loading } = useSelector((state) => state.orders);
  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(fetchOrdersThunk("farmer"));
  }, [dispatch]);

  const changeStatus = async (id, status) => {
    setUpdatingId(id);
    const result = await dispatch(updateOrderStatusThunk({ id, status }));
    setUpdatingId(null);

    if (updateOrderStatusThunk.fulfilled.match(result)) {
      toast.success(`Order marked ${status.replace(/_/g, " ").toLowerCase()}`);
    } else {
      toast.error(result.payload?.message || "Could not update order");
    }
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle="Orders placed for your products." />

      {loading ? (
        <Loader label="Loading orders..." />
      ) : !orders?.length ? (
        <EmptyState title="No orders yet" description="Orders from buyers will show up here." />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const actions = NEXT_ACTIONS[order.status] || [];
            const canCancel = order.status !== "DELIVERED" && order.status !== "CANCELLED";

            return (
              <OrderCard
                key={order.id}
                order={order}
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    {actions.map((a) => (
                      <Button
                        key={a.status}
                        size="sm"
                        loading={updatingId === order.id}
                        onClick={() => changeStatus(order.id, a.status)}
                      >
                        {a.label}
                      </Button>
                    ))}
                    {canCancel && (
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={updatingId === order.id}
                        onClick={() => changeStatus(order.id, "CANCELLED")}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
