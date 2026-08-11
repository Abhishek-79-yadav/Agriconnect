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
  const itemCount = order.items?.length;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-display text-ink">Order #{order.id}</h4>
          <Badge text={order.status} tone={STATUS_TONE[order.status] || "neutral"} />
        </div>
        <p className="mt-1 text-sm text-ink/60">
          {itemCount ? `${itemCount} item${itemCount > 1 ? "s" : ""} · ` : ""}
          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-display text-lg text-ink">₹{total}</span>
        {action}
      </div>
    </div>
  );
}
