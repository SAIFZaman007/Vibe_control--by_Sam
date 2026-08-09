import { useEffect, useRef, useState, useCallback } from "react";
import { UploadCloud, ImagePlus, Wand2, Download, RotateCcw, X, Film, Heart } from "lucide-react";
import { api, errorMessage } from "../api/client";
import StyleCard from "../components/StyleCard";
import CompareSlider from "../components/CompareSlider";
import AuthImage from "../components/AuthImage";
import AuthVideo from "../components/AuthVideo";

const MAX_IMAGE_MB = 15;
const MAX_VIDEO_MB = 50;
const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const VIDEO_ACCEPT = "video/mp4,video/quicktime,video/webm";
const CONTENT_ACCEPT = `${IMAGE_ACCEPT},${VIDEO_ACCEPT}`;

function Dropzone({ label, hint, previewUrl, onFile, onClear, icon: Icon, accept = IMAGE_ACCEPT, isVideo = false }) {
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
          {isVideo ? (
            <video src={previewUrl} className="max-h-40 rounded-xl" controls muted playsInline />
          ) : (
            <img src={previewUrl} alt="Selected preview" className="max-h-40 rounded-xl object-contain" />
          )}
          <button
            type="button" onClick={onClear}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-ink shadow hover:bg-canvas"
            aria-label="Remove file"
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
        ref={inputRef} type="file" accept={accept} className="hidden"
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
  const [fileIsVideo, setFileIsVideo] = useState(false);

  const [styleKey, setStyleKey] = useState(null);
  const [customFile, setCustomFile] = useState(null);
  const [customPreview, setCustomPreview] = useState(null);

  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadPct, setUploadPct] = useState(null);
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
    const isVid = f.type.startsWith("video/");
    const capMb = isVid ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    if (f.size > capMb * 1024 * 1024) {
      setError(`${isVid ? "Video" : "Image"} is too large (max ${capMb} MB).`);
      return;
    }
    setError("");
    setResult(null);
    setFileIsVideo(isVid);
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
    setFile(null); setFilePreview(null); setFileIsVideo(false); setResult(null);
  };
  const clearCustom = () => {
    if (customPreview) URL.revokeObjectURL(customPreview);
    setCustomFile(null); setCustomPreview(null);
    if (styleKey === "custom") setStyleKey(null);
  };

  // Revoke each object URL only when THAT url itself changes (or on unmount).
  // These must be two separate effects: a single effect keyed on both
  // [filePreview, customPreview] would revoke BOTH urls whenever either one
  // changed (its cleanup closure captures both), which meant picking a custom
  // style image after already uploading a photo silently killed the photo's
  // preview blob — that's what was breaking the "before" side of the compare
  // slider. Scoping each effect to its own single dependency fixes that.
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  useEffect(() => {
    return () => {
      if (customPreview) URL.revokeObjectURL(customPreview);
    };
  }, [customPreview]);

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
    setUploadPct(0);
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
        onUploadProgress: (e) => {
          if (e.total) setUploadPct(Math.round((e.loaded / e.total) * 100));
        },
      });
      setResult(data);
    } catch (err) {
      setError(errorMessage(err, "Style transfer failed. Try another file."));
    } finally {
      setBusy(false);
      setUploadPct(null);
    }
  };

  const download = async () => {
    if (!result) return;
    const res = await api.get(`${result.output_url}&download=true`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    const ext = result.media_type === "video" ? "mp4" : "jpg";
    a.download = `vibe-control-${result.style_key}-${result.id}.${ext}`;
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

  // Favorite the *result itself* (not the vibe used to make it) — this is
  // separate from the heart on each StyleCard above, which bookmarks a vibe
  // for next time. It's the only way to save a "transfer your own style"
  // result, since custom styles aren't in the preset catalog to favorite.
  const toggleResultFavorite = async () => {
    if (!result) return;
    const next = !result.is_favorite;
    setResult((r) => ({ ...r, is_favorite: next })); // optimistic
    try {
      if (next) await api.post(`/api/images/${result.id}/favorite`);
      else await api.delete(`/api/images/${result.id}/favorite`);
    } catch {
      setResult((r) => ({ ...r, is_favorite: !next })); // revert on failure
    }
  };

  // Busy label: show upload progress first, then the "restyling" phase.
  const busyLabel =
    uploadPct !== null && uploadPct < 100
      ? `Uploading… ${uploadPct}%`
      : `Restyling your ${fileIsVideo ? "video" : "photo"}…`;

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">Studio</h1>
        <p className="mt-1 text-muted">Upload a photo or video, choose a vibe, and make it art.</p>
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
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">1 · Your media</h2>
            <Dropzone
              label="Upload a photo or video" hint="Image or MP4 · up to 50 MB"
              previewUrl={filePreview} onFile={selectContent} onClear={clearContent}
              icon={UploadCloud} accept={CONTENT_ACCEPT} isVideo={fileIsVideo}
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
                  icon={ImagePlus} accept={IMAGE_ACCEPT} isVideo={false}
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
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> {busyLabel}</>
              ) : (
                <><Wand2 size={18} /> Apply vibe</>
              )}
            </button>
            {!file && <p className="mt-2 text-center text-xs text-muted">Upload a photo or video to begin.</p>}
            {file && !styleKey && <p className="mt-2 text-center text-xs text-muted">Choose a vibe to continue.</p>}
            {fileIsVideo && <p className="mt-2 text-center text-xs text-muted">Videos are processed frame-by-frame — longer clips take a little longer.</p>}
          </section>
        </div>

        {/* Result */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Result</h2>

            {result ? (
              <div className="space-y-4 animate-fade-up">
                {result.media_type === "video" ? (
                  <div className="overflow-hidden rounded-2xl bg-black">
                    <AuthVideo path={result.output_url} className="w-full" controls />
                  </div>
                ) : (
                  <CompareSlider
                    before={<img src={filePreview} alt="Original" className="h-full w-full object-cover" />}
                    after={<AuthImage path={result.output_url} alt="Stylized" className="h-full w-full object-cover" />}
                  />
                )}
                <p className="text-sm text-muted">
                  {result.media_type === "video"
                    ? "Your stylized video with its original audio. Saved to your "
                    : "Drag the handle to compare. Saved to your "}
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
                <button
                  onClick={toggleResultFavorite}
                  className={`btn-ghost w-full ${result.is_favorite ? "border-pulse/40 bg-pulse/5 text-pulse" : ""}`}
                >
                  <Heart size={16} className={result.is_favorite ? "fill-pulse text-pulse" : ""} />
                  {result.is_favorite ? "Added to favorites" : "Add to favorites"}
                </button>
              </div>
            ) : busy ? (
              <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-canvas">
                <div className="text-center">
                  <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-line border-t-vibe" />
                  <p className="mt-3 text-sm text-muted">{busyLabel}</p>
                </div>
              </div>
            ) : (
              <div className="grid aspect-[4/3] place-items-center rounded-2xl border border-dashed border-line bg-canvas">
                <div className="px-6 text-center text-muted">
                  <Film className="mx-auto mb-2 opacity-40" size={28} />
                  <p className="text-sm">Your restyled image or video will appear here.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}