import { useEffect, useRef, useState, useCallback } from "react";
import { UploadCloud, ImagePlus, Wand2, Download, RotateCcw, X } from "lucide-react";
import { api, errorMessage } from "../api/client";
import StyleCard from "../components/StyleCard";
import CompareSlider from "../components/CompareSlider";
import AuthImage from "../components/AuthImage";

const MAX_MB = 15;
const ACCEPT = "image/jpeg,image/png,image/webp";

function Dropzone({ label, hint, previewUrl, onFile, onClear, icon: Icon }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const f = files?.[0];
    if (f) onFile(f);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      className={`relative flex min-h-[168px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition
        ${dragging ? "border-vibe bg-vibe/5" : "border-line bg-canvas hover:border-ink/25"}`}
    >
      {previewUrl ? (
        <>
          <img src={previewUrl} alt="Selected preview" className="max-h-40 rounded-xl object-contain" />
          <button
            type="button" onClick={onClear}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-ink shadow hover:bg-canvas"
            aria-label="Remove image"
          >
            <X size={15} />
          </button>
        </>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className="flex flex-col items-center gap-2">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-vibe/10 text-vibe">
            <Icon size={20} />
          </span>
          <span className="text-sm font-semibold text-ink">{label}</span>
          <span className="text-xs text-muted">{hint}</span>
        </button>
      )}
      <input
        ref={inputRef} type="file" accept={ACCEPT} className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

export default function Studio() {
  const [styles, setStyles] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [styleKey, setStyleKey] = useState(null);
  const [customFile, setCustomFile] = useState(null);
  const [customPreview, setCustomPreview] = useState(null);

  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Load styles + favorites once.
  useEffect(() => {
    api.get("/api/styles").then((r) => setStyles(r.data)).catch(() => {});
    api.get("/api/favorites")
      .then((r) => setFavorites(new Set(r.data.map((f) => f.style_key))))
      .catch(() => {});
  }, []);

  // Manage object URLs for previews.
  const selectContent = useCallback((f) => {
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Image is too large (max ${MAX_MB} MB).`);
      return;
    }
    setError("");
    setResult(null);
    setFile(f);
    setFilePreview((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(f); });
  }, []);

  const selectCustom = useCallback((f) => {
    setStyleKey("custom");
    setCustomFile(f);
    setCustomPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(f); });
  }, []);

  const clearContent = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null); setFilePreview(null); setResult(null);
  };
  const clearCustom = () => {
    if (customPreview) URL.revokeObjectURL(customPreview);
    setCustomFile(null); setCustomPreview(null);
    if (styleKey === "custom") setStyleKey(null);
  };

  useEffect(() => () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    if (customPreview) URL.revokeObjectURL(customPreview);
  }, [filePreview, customPreview]);

  const toggleFavorite = async (key) => {
    const isFav = favorites.has(key);
    // Optimistic update.
    setFavorites((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(key) : next.add(key);
      return next;
    });
    try {
      if (isFav) await api.delete(`/api/favorites/${key}`);
      else await api.post("/api/favorites", { style_key: key });
    } catch {
      // Revert on failure.
      setFavorites((prev) => {
        const next = new Set(prev);
        isFav ? next.add(key) : next.delete(key);
        return next;
      });
    }
  };

  const canSubmit = file && styleKey && (styleKey !== "custom" || customFile) && !busy;

  const applyVibe = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("style_key", styleKey);
      form.append("title", title || "Untitled");
      if (styleKey === "custom" && customFile) form.append("custom_style", customFile);

      const { data } = await api.post("/api/images/stylize", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      setError(errorMessage(err, "Style transfer failed. Try another image."));
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!result) return;
    const res = await api.get(`${result.output_url}&download=true`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibe-control-${result.style_key}-${result.id}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startOver = () => {
    clearContent();
    clearCustom();
    setStyleKey(null);
    setTitle("");
    setError("");
  };

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">Studio</h1>
        <p className="mt-1 text-muted">Upload a photo, choose a vibe, and make it art.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Controls */}
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">1 · Your photo</h2>
            <Dropzone
              label="Upload a photo" hint="JPG, PNG or WebP · up to 15 MB"
              previewUrl={filePreview} onFile={selectContent} onClear={clearContent}
              icon={UploadCloud}
            />
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted">2 · Pick a vibe</h2>
              <span className="text-xs text-muted">Tap ♥ to save a favorite</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {styles.map((s) => (
                <StyleCard
                  key={s.key} style={s}
                  selected={styleKey === s.key}
                  favorited={favorites.has(s.key)}
                  onSelect={setStyleKey}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            {/* Custom style */}
            <div className="mt-4 border-t border-line pt-4">
              <p className="mb-2 text-sm font-semibold">Or transfer your own style</p>
              <div className={`rounded-xl ${styleKey === "custom" ? "ring-2 ring-vibe/40" : ""}`}>
                <Dropzone
                  label="Upload a style image" hint="We'll transfer its colors & texture"
                  previewUrl={customPreview} onFile={selectCustom} onClear={clearCustom}
                  icon={ImagePlus}
                />
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">3 · Name &amp; create</h2>
            <label className="label" htmlFor="title">Title (optional)</label>
            <input
              id="title" className="input" placeholder="e.g. Sunset over the harbor"
              value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
            />
            <button onClick={applyVibe} disabled={!canSubmit} className="btn-primary mt-4 w-full text-base">
              {busy ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Applying vibe…</>
              ) : (
                <><Wand2 size={18} /> Apply vibe</>
              )}
            </button>
            {!file && <p className="mt-2 text-center text-xs text-muted">Upload a photo to begin.</p>}
            {file && !styleKey && <p className="mt-2 text-center text-xs text-muted">Choose a vibe to continue.</p>}
          </section>
        </div>

        {/* Result */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Result</h2>

            {result ? (
              <div className="space-y-4 animate-fade-up">
                <CompareSlider
                  before={<img src={filePreview} alt="Original" className="h-full w-full object-cover" />}
                  after={<AuthImage path={result.output_url} alt="Stylized" className="h-full w-full object-cover" />}
                />
                <p className="text-sm text-muted">
                  Drag the handle to compare. Saved to your{" "}
                  <span className="font-semibold text-ink">Gallery</span>.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={download} className="btn-primary flex-1">
                    <Download size={18} /> Download
                  </button>
                  <button onClick={startOver} className="btn-ghost">
                    <RotateCcw size={16} /> New
                  </button>
                </div>
              </div>
            ) : busy ? (
              <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-canvas">
                <div className="text-center">
                  <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-line border-t-vibe" />
                  <p className="mt-3 text-sm text-muted">Restyling your photo…</p>
                </div>
              </div>
            ) : (
              <div className="grid aspect-[4/3] place-items-center rounded-2xl border border-dashed border-line bg-canvas">
                <div className="px-6 text-center text-muted">
                  <Wand2 className="mx-auto mb-2 opacity-40" size={28} />
                  <p className="text-sm">Your restyled image will appear here.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
