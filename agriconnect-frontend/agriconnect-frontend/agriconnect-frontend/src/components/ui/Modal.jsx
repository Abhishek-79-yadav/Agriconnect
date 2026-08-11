import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, className = "" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div
        className={`w-full max-w-md rounded-lg border border-line bg-card p-6 shadow-lg ${className}`}
      >
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="font-display text-lg text-ink">{title}</h3>}
          <button
            onClick={onClose}
            className="ml-auto rounded p-1 text-ink/50 hover:bg-paper hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
