import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { fetchOrdersThunk, updateOrderStatusThunk } from "../../redux/thunks/orderThunk";
import OrderCard from "../../components/cards/OrderCard";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

// A buyer can only cancel — and only before the farmer has shipped it.
const CANCELLABLE = ["PENDING", "CONFIRMED"];

export default function Orders() {
  const dispatch = useDispatch();
  const { orders: rawOrders, loading } = useSelector((state) => state.orders);
  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    dispatch(fetchOrdersThunk("buyer"));
  }, [dispatch]);

  const confirmCancel = async () => {
    setCancelling(true);
    const result = await dispatch(updateOrderStatusThunk({ id: toCancel.id, status: "CANCELLED" }));
    setCancelling(false);
    setToCancel(null);

    if (updateOrderStatusThunk.fulfilled.match(result)) {
      toast.success("Order cancelled");
    } else {
      toast.error(result.payload?.message || "Could not cancel order");
    }
  };

  return (
    <div>
      <PageHeader title="My orders" />

      {loading ? (
        <Loader label="Loading orders..." />
      ) : !orders?.length ? (
        <EmptyState title="No orders yet" description="Orders you place will show up here." />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              action={
                CANCELLABLE.includes(order.status) && (
                  <Button variant="ghost" size="sm" onClick={() => setToCancel(order)}>
                    Cancel order
                  </Button>
                )
              }
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toCancel}
        title="Cancel this order?"
        message={`Order #${toCancel?.id} will be cancelled — this can't be undone.`}
        danger
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      />
    </div>
  );
}
