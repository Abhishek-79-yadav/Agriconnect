import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Leaf, ShoppingCart, Heart, MapPin } from "lucide-react";

import { fetchProductDetails } from "../../redux/thunks/productThunk";
import { addToCartThunk } from "../../redux/thunks/cartThunk";
import { addWishlistThunk } from "../../redux/thunks/wishlistThunk";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Breadcrumb from "../../components/ui/Breadcrumb";

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);

  const { product, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [dispatch, id]);

  if (loading || !product) return <Loader label="Loading product..." full />;

  const name = product.productName || product.name;

  const handleAddToCart = async () => {
    const result = await dispatch(addToCartThunk({ productId: product.id, qty }));
    if (addToCartThunk.fulfilled.match(result)) {
      toast.success("Added to cart");
    } else {
      toast.error("Could not add to cart");
    }
  };

  const handleWishlist = async () => {
    const result = await dispatch(addWishlistThunk(product.id));
    if (addWishlistThunk.fulfilled.match(result)) {
      toast.success("Added to wishlist");
    } else {
      toast.error("Could not add to wishlist");
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: "Products", to: "/products" }, { label: name }]} />

      <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-lg border border-line bg-card">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gold-light/40">
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gold text-card">
                <Leaf className="h-12 w-12" />
              </span>
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-2xl text-ink">{name}</h1>

          {(product.city || product.state) && (
            <p className="mt-1 flex items-center gap-1 text-sm text-ink/60">
              <MapPin className="h-4 w-4" />
              {[product.city, product.state].filter(Boolean).join(", ")}
            </p>
          )}

          <p className="mt-4 font-display text-3xl text-gold-dark">
            ₹{product.price}
            <span className="ml-1 text-sm font-normal text-ink/50">/ {product.unit?.toLowerCase() || "unit"}</span>
          </p>

          {product.description && <p className="mt-4 text-sm leading-relaxed text-ink/70">{product.description}</p>}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded border border-line">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-ink/70 hover:bg-paper">−</button>
              <span className="px-3 text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 text-ink/70 hover:bg-paper">+</button>
            </div>

            <Button onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="h-4 w-4" /> Add to cart
            </Button>

            <Button variant="outline" onClick={handleWishlist}>
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          <Link to="/products" className="mt-6 inline-block text-sm text-gold-dark hover:underline">
            ← Back to products
          </Link>
        </div>
      </div>
    </div>
  );
}
