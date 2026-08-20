import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { CreditCard, MessageSquareWarning } from "lucide-react";

import { fetchOrdersThunk, updateOrderStatusThunk } from "../../redux/thunks/orderThunk";
import { fileDisputeApi } from "../../api/orderApi";
import OrderCard from "../../components/cards/OrderCard";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Modal from "../../components/ui/Modal";
import Payment from "./Payment";

// A buyer can only cancel — and only before the farmer has shipped it.
const CANCELLABLE = ["PENDING", "CONFIRMED"];

export default function Orders() {
  const dispatch = useDispatch();
  const { orders: rawOrders, loading } = useSelector((state) => state.orders);
  const orders = Array.isArray(rawOrders) ? rawOrders : [];
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [disputingOrder, setDisputingOrder] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [filingDispute, setFilingDispute] = useState(false);

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

  const submitDispute = async () => {
    if (!disputeReason.trim()) {
      toast.error("Please give a reason");
      return;
    }
    setFilingDispute(true);
    try {
      await fileDisputeApi({
        orderId: disputingOrder.id,
        reason: disputeReason.trim(),
        description: disputeDescription.trim(),
      });
      toast.success("Dispute filed — our team will review it");
      setDisputingOrder(null);
      setDisputeReason("");
      setDisputeDescription("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not file dispute");
    } finally {
      setFilingDispute(false);
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
          {orders.map((order) => {
            // An ONLINE order that's still PENDING and unpaid means the
            // buyer either backed out of the Razorpay modal or the payment
            // failed — without this, there was no way back into payment
            // for that order once it left the checkout page.
            const needsPayment = order.paymentMethod === "ONLINE" && order.status === "PENDING" && !order.paid;

            return (
              <OrderCard
                key={order.id}
                order={order}
                action={
                  <div className="flex items-center gap-2">
                    {needsPayment && (
                      <Button size="sm" onClick={() => setPayingOrderId(order.id)}>
                        <CreditCard className="h-3.5 w-3.5" /> Pay now
                      </Button>
                    )}
                    {CANCELLABLE.includes(order.status) && (
                      <Button variant="ghost" size="sm" onClick={() => setToCancel(order)}>
                        Cancel order
                      </Button>
                    )}
                    {order.status === "DELIVERED" && (
                      <Button variant="ghost" size="sm" onClick={() => setDisputingOrder(order)}>
                        <MessageSquareWarning className="h-3.5 w-3.5" /> Report an issue
                      </Button>
                    )}
                  </div>
                }
              />
            );
          })}
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

      <Modal open={!!payingOrderId} onClose={() => setPayingOrderId(null)} title="Complete payment">
        {payingOrderId && <Payment orderId={payingOrderId} />}
      </Modal>

      <Modal open={!!disputingOrder} onClose={() => setDisputingOrder(null)} title={`Report an issue — Order #${disputingOrder?.id}`}>
        <div className="flex flex-col gap-3">
          <Input label="Reason" placeholder="e.g. Item damaged, wrong item, quality issue" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} />
          <textarea
            value={disputeDescription}
            onChange={(e) => setDisputeDescription(e.target.value)}
            placeholder="Tell us more (optional)"
            rows={3}
            className="w-full rounded border border-line bg-paper p-2 text-sm text-ink outline-none focus:border-gold"
          />
          <Button onClick={submitDispute} loading={filingDispute} className="self-start">Submit</Button>
        </div>
      </Modal>
    </div>
  );
}
