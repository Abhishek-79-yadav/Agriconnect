import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CreditCard, Truck, CheckCircle2 } from "lucide-react";

import { placeOrderThunk } from "../../redux/thunks/orderThunk";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Payment from "./Payment";

const PAYMENT_METHODS = [
  { value: "ONLINE", label: "Card / UPI / Netbanking", icon: CreditCard, hint: "Pay now via Razorpay" },
  { value: "COD", label: "Cash on Delivery", icon: Truck, hint: "Pay when your order arrives" },
];

const EMPTY_ADDRESS = {
  deliveryName: "",
  deliveryPhone: "",
  deliveryAddressLine: "",
  deliveryCity: "",
  deliveryState: "",
  deliveryPincode: "",
};

export default function Checkout() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const [method, setMethod] = useState("ONLINE");
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // React state updates aren't synchronous — on mobile a fast double-tap
  // can fire this handler twice before the button's `disabled` prop
  // actually re-renders, placing the same order twice. A ref is checked
  // and set immediately (no re-render needed) so the second tap bails
  // out right away.
  const submittingRef = useRef(false);

  const total = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  const addressComplete = Object.values(address).every((v) => v.trim().length > 0);

  const setField = (field) => (e) => setAddress((a) => ({ ...a, [field]: e.target.value }));

  const checkout = async () => {
    if (submittingRef.current) return;
    if (!addressComplete) {
      toast.error("Please fill in your delivery address");
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    const result = await dispatch(placeOrderThunk({ paymentMethod: method, ...address }));
    submittingRef.current = false;
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
            <div className="mt-6 flex flex-col gap-3">
              <span className="text-sm font-medium text-ink">Delivery address</span>
              <Input label="Full name" value={address.deliveryName} onChange={setField("deliveryName")} />
              <Input label="Phone number" type="tel" value={address.deliveryPhone} onChange={setField("deliveryPhone")} />
              <Input label="Address" value={address.deliveryAddressLine} onChange={setField("deliveryAddressLine")} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Input label="City" value={address.deliveryCity} onChange={setField("deliveryCity")} />
                <Input label="State" value={address.deliveryState} onChange={setField("deliveryState")} />
                <Input label="Pincode" value={address.deliveryPincode} onChange={setField("deliveryPincode")} />
              </div>
            </div>

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

            <Button onClick={checkout} loading={submitting} disabled={!items.length || !addressComplete} className="mt-6 w-full">
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
