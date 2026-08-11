import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

const SIZES = {
  sm: { mark: "h-6 w-6", icon: "h-3.5 w-3.5", text: "text-base" },
  md: { mark: "h-9 w-9", icon: "h-5 w-5", text: "text-xl" },
  lg: { mark: "h-12 w-12", icon: "h-6 w-6", text: "text-2xl" },
};

/** Brand mark + wordmark, used in the navbar, footer and auth pages. */
export default function Logo({ size = "md", to = "/", withText = true, className = "" }) {
  const s = SIZES[size] || SIZES.md;

  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`flex ${s.mark} shrink-0 items-center justify-center rounded-full bg-gold text-card`}>
        <Leaf className={s.icon} />
      </span>
      {withText && (
        <span className={`font-display ${s.text} font-medium text-ink`}>AgriConnect</span>
      )}
    </span>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}
