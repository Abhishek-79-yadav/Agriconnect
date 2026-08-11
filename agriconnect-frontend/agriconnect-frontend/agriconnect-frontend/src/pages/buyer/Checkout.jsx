import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CreditCard, Truck, CheckCircle2 } from "lucide-react";

import { placeOrderThunk } from "../../redux/thunks/orderThunk";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import Payment from "./Payment";

const PAYMENT_METHODS = [
  { value: "ONLINE", label: "Card / UPI / Netbanking", icon: CreditCard, hint: "Pay now via Razorpay" },
  { value: "COD", label: "Cash on Delivery", icon: Truck, hint: "Pay when your order arrives" },
];

export default function Checkout() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const [method, setMethod] = useState("ONLINE");
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const total = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  const checkout = async () => {
    setSubmitting(true);
    const result = await dispatch(placeOrderThunk(method));
    setSubmitting(false);

    if (placeOrderThunk.fulfilled.match(result)) {
      setPlacedOrder(result.payload);
      if (method === "COD") {
        toast.success("Order placed! Pay cash when it arrives.");
      } else {
        toast.success("Order placed — now pay to confirm it");
      }
    } else {
      toast.error(result.payload?.message || "Could not place order");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Checkout" subtitle="Review your order before paying." />

      <div className="rounded-lg border border-line bg-card p-5">
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-ink/70">
              <span>{item.productName} × {item.quantity}</span>
              <span>₹{item.totalPrice}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between border-t border-line pt-4 font-display text-lg text-ink">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        {!placedOrder ? (
          <>
            <div className="mt-6 flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">Payment method</span>
              {PAYMENT_METHODS.map(({ value, label, icon: Icon, hint }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-3 rounded border p-3 transition ${
                    method === value ? "border-gold bg-gold-light/40" : "border-line bg-paper"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={method === value}
                    onChange={() => setMethod(value)}
                    className="h-4 w-4 text-gold focus:ring-gold"
                  />
                  <Icon className="h-5 w-5 text-ink/60" />
                  <span>
                    <span className="block text-sm font-medium text-ink">{label}</span>
                    <span className="block text-xs text-ink/50">{hint}</span>
                  </span>
                </label>
              ))}
            </div>

            <Button onClick={checkout} loading={submitting} disabled={!items.length} className="mt-6 w-full">
              Place order
            </Button>
          </>
        ) : method === "COD" ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded border border-field/30 bg-field-light/40 p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-field-dark" />
            <p className="font-display text-lg text-ink">Order #{placedOrder.id} placed!</p>
            <p className="text-sm text-ink/60">Pay ₹{placedOrder.totalPrice} in cash when it's delivered.</p>
            <Link to="/buyer/orders">
              <Button variant="outline">View my orders</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            <Payment orderId={placedOrder.id} />
          </div>
        )}
      </div>
    </div>
  );
}
