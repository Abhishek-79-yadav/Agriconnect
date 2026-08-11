import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { CreditCard } from "lucide-react";

import { createPaymentApi } from "../../api/paymentApi";
import { verifyPaymentThunk } from "../../redux/thunks/paymentThunk";
import Button from "../../components/ui/Button";

export default function Payment({ orderId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Backend returns { razorpayOrderId, amount, currency, razorpayKey }
      const order = await createPaymentApi(orderId);

      if (!window.Razorpay) {
        toast.error("Payment SDK failed to load — check your connection and try again");
        setLoading(false);
        return;
      }

      const options = {
        key: order.razorpayKey,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: "AgriConnect",

        // Razorpay only confirms the payment happened on ITS side here.
        // The order isn't actually paid until our backend verifies the
        // signature — that needs all three fields below, not just a
        // payment id, or the server-side check will always fail.
        handler: async (response) => {
          const result = await dispatch(
            verifyPaymentThunk({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
          );

          if (verifyPaymentThunk.fulfilled.match(result)) {
            navigate("/buyer/payment/success");
          } else {
            navigate("/buyer/payment/failed");
          }
        },

        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", () => {
        setLoading(false);
        navigate("/buyer/payment/failed");
      });

      rzp.open();
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Could not start payment");
    }
  };

  return (
    <Button onClick={handlePayment} loading={loading} className="w-full">
      <CreditCard className="h-4 w-4" /> Pay with Card / UPI / Netbanking
    </Button>
  );
}
