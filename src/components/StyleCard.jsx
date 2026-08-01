import { Check, Heart } from "lucide-react";
import { assetUrl } from "../api/client";

/**
 * A single selectable "vibe". Shows the generated style thumbnail, its name, and
 * a favorite toggle. `selected` highlights the active choice in the studio.
 */
export default function StyleCard({ style, selected, favorited, onSelect, onToggleFavorite }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(style.key)}
      className={`group relative overflow-hidden rounded-xl border text-left transition-all duration-150
        ${selected ? "border-vibe shadow-lift ring-2 ring-vibe/30" : "border-line hover:border-ink/25 hover:shadow-soft"}`}
    >
      <div className="relative aspect-[4/3] w-full">
        <img
          src={assetUrl(style.thumbnail_url)}
          alt={style.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {selected && (
          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-vibe shadow">
            <Check size={14} strokeWidth={3} />
          </span>
        )}
        {onToggleFavorite && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(style.key);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(style.key);
              }
            }}
            className="absolute left-2 top-2 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-white/90 text-ink shadow transition hover:scale-110"
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={13} className={favorited ? "fill-pulse text-pulse" : ""} />
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold text-ink">{style.name}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">{style.description}</p>
      </div>
    </button>
  );
}
