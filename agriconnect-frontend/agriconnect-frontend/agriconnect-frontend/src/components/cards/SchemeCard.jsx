import { Landmark } from "lucide-react";

export default function SchemeCard({ scheme }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-card p-5">
      <div className="flex items-center gap-2">
        <Landmark className="h-5 w-5 text-slate" />
        <h3 className="font-display text-ink">{scheme.title || scheme.name}</h3>
      </div>

      <p className="line-clamp-3 text-sm text-ink/60">{scheme.description}</p>

      {scheme.applyLink || scheme.link ? (
        <a
          href={scheme.applyLink || scheme.link}
          target="_blank"
          rel="noreferrer"
          className="mt-1 text-sm font-medium text-slate hover:underline"
        >
          Apply now →
        </a>
      ) : null}
    </div>
  );
}
