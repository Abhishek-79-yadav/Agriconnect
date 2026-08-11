import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus } from "lucide-react";

import { fetchCart, updateCartThunk, removeCartThunk } from "../../redux/thunks/cartThunk";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

// NOTE (kept from original): GET /api/buyer/cart returns CartResponse with
// only { id, productName, price, quantity, totalPrice } — the update/remove
// endpoints need a productId that isn't in that response yet. This page is
// wired correctly on the frontend; it needs the backend's CartResponse to
// also include productId before qty +/- and remove will actually work.
export default function Cart() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const total = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  if (loading) return <Loader label="Loading your cart..." full />;

  if (!items.length) {
    return (
      <div>
        <PageHeader title="My cart" />
        <EmptyState
          title="Your cart is empty"
          description="Browse fresh produce and add something to your cart."
          action={
            <Link to="/products">
              <Button>Browse products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My cart" subtitle={`${items.length} item${items.length > 1 ? "s" : ""}`} />

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-card p-4">
            <div>
              <h4 className="font-display text-ink">{item.productName}</h4>
              <p className="text-sm text-ink/60">₹{item.price} each</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center rounded border border-line">
                <button
                  onClick={() => dispatch(updateCartThunk({ productId: item.productId, qty: item.quantity - 1 }))}
                  disabled={item.quantity <= 1}
                  className="p-2 text-ink/70 hover:bg-paper disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-3 text-sm">{item.quantity}</span>
                <button
                  onClick={() => dispatch(updateCartThunk({ productId: item.productId, qty: item.quantity + 1 }))}
                  className="p-2 text-ink/70 hover:bg-paper"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="w-20 text-right font-medium text-ink">₹{item.totalPrice}</span>

              <button
                onClick={() => dispatch(removeCartThunk(item.productId))}
                className="rounded p-2 text-rust hover:bg-rust-light"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-line bg-card p-4">
        <span className="font-display text-lg text-ink">Total: ₹{total}</span>
        <Link to="/buyer/checkout">
          <Button size="lg">Proceed to checkout</Button>
        </Link>
      </div>
    </div>
  );
}
