import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import Badge from "../ui/Badge";

export default function ProductCard({ product, action }) {
  const name = product.productName || product.name || "Unnamed product";
  const price = product.price ?? "-";
  const unit = product.unit?.toLowerCase() || "unit";

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-line bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/products/${product.id}`} className="block aspect-[4/3] overflow-hidden bg-paper">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gold-light/40">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-card">
              <Leaf className="h-7 w-7" />
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${product.id}`} className="font-display text-base text-ink hover:text-gold-dark">
            {name}
          </Link>
          {product.category && <Badge text={product.category} tone="field" />}
        </div>

        {product.description && (
          <p className="line-clamp-2 text-sm text-ink/60">{product.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-lg text-gold-dark">
            ₹{price}
            <span className="ml-1 text-xs font-normal text-ink/50">/ {unit}</span>
          </span>
          {action}
        </div>
      </div>
    </div>
  );
}
