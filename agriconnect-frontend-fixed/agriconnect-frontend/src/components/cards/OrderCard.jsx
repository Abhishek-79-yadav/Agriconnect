import Badge from "../ui/Badge";

const STATUS_TONE = {
  PENDING: "gold",
  CONFIRMED: "slate",
  SHIPPED: "slate",
  OUT_FOR_DELIVERY: "slate",
  DELIVERED: "field",
  CANCELLED: "rust",
};

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

      {order.couponCode && (
        <p className="text-xs text-ink/50">Coupon applied: {order.couponCode} (−₹{order.discount ?? 0})</p>
      )}
    </div>
  );
}
