import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-vibe-gradient text-white">
            <Sparkles size={12} />
          </span>
          <span>
            <span className="font-semibold text-ink">Vibe Control</span> — style studio
          </span>
        </div>
        <p className="text-xs text-muted">
          Built with React &amp; FastAPI · Style transfer runs on open-source tooling.
        </p>
      </div>
    </footer>
  );
}