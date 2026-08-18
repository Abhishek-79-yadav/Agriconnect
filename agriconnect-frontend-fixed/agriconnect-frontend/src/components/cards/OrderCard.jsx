import { CheckCircle2, Circle } from "lucide-react";
import Badge from "../ui/Badge";

const STATUS_TONE = {
  PENDING: "gold",
  CONFIRMED: "slate",
  SHIPPED: "slate",
  OUT_FOR_DELIVERY: "slate",
  DELIVERED: "field",
  CANCELLED: "rust",
};

// Buyer-facing tracking steps — PENDING is folded into CONFIRMED (an
// unpaid ONLINE order hasn't reached the farmer yet, so there's nothing
// to visually track before that point).
const TRACK_STEPS = [
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

function OrderTracker({ status }) {
  if (status === "CANCELLED") {
    return <p className="text-sm text-rust">This order was cancelled.</p>;
  }

  const currentIndex = TRACK_STEPS.findIndex((s) => s.key === status);
  // PENDING (unpaid ONLINE order) hasn't reached step 0 yet.
  const reachedIndex = currentIndex === -1 ? -1 : currentIndex;

  return (
    <div className="flex items-center">
      {TRACK_STEPS.map((step, i) => {
        const done = i <= reachedIndex;
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-field-dark" />
              ) : (
                <Circle className="h-5 w-5 text-line" />
              )}
              <span className={`text-[11px] ${done ? "text-ink" : "text-ink/40"}`}>{step.label}</span>
            </div>
            {i < TRACK_STEPS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${i < reachedIndex ? "bg-field-dark" : "bg-line"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderCard({ order, action }) {
  const total = order.totalPrice ?? order.totalAmount ?? 0;
  const items = order.items || [];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-display text-ink">Order #{order.id}</h4>
            <Badge text={order.status} tone={STATUS_TONE[order.status] || "neutral"} />
          </div>
          <p className="mt-1 text-sm text-ink/60">
            {items.length ? `${items.length} item${items.length > 1 ? "s" : ""} · ` : ""}
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
            {order.paymentMethod ? ` · ${order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online"}` : ""}
            {order.paymentMethod === "ONLINE" && (order.paid ? " (paid)" : " (unpaid)")}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-display text-lg text-ink">₹{total}</span>
          {action}
        </div>
      </div>

      <div className="border-t border-line pt-3">
        <OrderTracker status={order.status} />
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-line pt-3">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm text-ink/70">
              <span>{item.productName} × {item.quantity}</span>
              <span>₹{item.price}</span>
            </div>
          ))}
        </div>
      )}

      {order.deliveryAddressLine && (
        <div className="border-t border-line pt-3 text-sm text-ink/70">
          <p className="font-medium text-ink">{order.deliveryName} · {order.deliveryPhone}</p>
          <p>{order.deliveryAddressLine}, {order.deliveryCity}, {order.deliveryState} - {order.deliveryPincode}</p>
        </div>
      )}

      {order.couponCode && (
        <p className="text-xs text-ink/50">Coupon applied: {order.couponCode} (−₹{order.discount ?? 0})</p>
      )}
    </div>
  );
}
