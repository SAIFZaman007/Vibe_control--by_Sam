import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Trash2, ImageOff, Plus, Film, Heart } from "lucide-react";
import { api } from "../api/client";
import AuthImage from "../components/AuthImage";
import AuthVideo from "../components/AuthVideo";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return ""; }
}

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/api/images")
      .then((r) => setImages(r.data))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id) => {
    setImages((prev) => prev.filter((i) => i.id !== id)); // optimistic
    try {
      await api.delete(`/api/images/${id}`);
    } catch {
      load(); // reload on failure
    }
  };

  const toggleFavorite = async (img) => {
    const next = !img.is_favorite;
    setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, is_favorite: next } : i)));
    try {
      if (next) await api.post(`/api/images/${img.id}/favorite`);
      else await api.delete(`/api/images/${img.id}/favorite`);
    } catch {
      setImages((prev) => prev.map((i) => (i.id === img.id ? { ...i, is_favorite: !next } : i)));
    }
  };

  const visibleImages = favoritesOnly ? images.filter((i) => i.is_favorite) : images;

  const download = async (img) => {
    const res = await api.get(`${img.output_url}&download=true`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    const ext = img.media_type === "video" ? "mp4" : "jpg";
    a.download = `vibe-control-${img.style_key}-${img.id}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Gallery</h1>
          <p className="mt-1 text-muted">Everything you've created, in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <button
              onClick={() => setFavoritesOnly((v) => !v)}
              className={favoritesOnly ? "btn-subtle" : "btn-ghost"}
              aria-pressed={favoritesOnly}
            >
              <Heart size={16} className={favoritesOnly ? "fill-pulse text-pulse" : ""} />
              Favorites
            </button>
          )}
          <Link to="/studio" className="btn-primary shrink-0">
            <Plus size={18} /> New creation
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-2xl" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="card grid place-items-center py-20 text-center">
          <ImageOff className="mb-3 text-muted opacity-40" size={40} />
          <h2 className="text-lg font-bold">No creations yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Head to the studio, upload a photo or video, and apply your first vibe.
          </p>
          <Link to="/studio" className="btn-primary mt-6">Open studio</Link>
        </div>
      ) : visibleImages.length === 0 ? (
        <div className="card grid place-items-center py-20 text-center">
          <Heart className="mb-3 text-muted opacity-40" size={40} />
          <h2 className="text-lg font-bold">No favorites yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Tap the heart on a creation to save it here.
          </p>
          <button onClick={() => setFavoritesOnly(false)} className="btn-primary mt-6">
            Show everything
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {visibleImages.map((img) => {
            const isVideo = img.media_type === "video";
            return (
              <div key={img.id} className="card group overflow-hidden">
                <div className="relative aspect-square">
                  {isVideo ? (
                    <AuthVideo path={img.output_url} className="h-full w-full object-cover" controls muted />
                  ) : (
                    <AuthImage path={img.output_url} alt={img.title} className="h-full w-full object-cover" />
                  )}
                  {isVideo && (
                    <span className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      <Film size={11} /> Video
                    </span>
                  )}
                  {img.is_favorite && (
                    <span className="pointer-events-none absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow">
                      <Heart size={13} className="fill-pulse text-pulse" />
                    </span>
                  )}
                  <div
                    className={`pointer-events-none absolute inset-0 flex gap-2 p-3 opacity-0 transition group-hover:opacity-100
                      ${isVideo
                        ? "items-start justify-end bg-gradient-to-b from-ink/60 via-transparent"
                        : "items-end justify-center bg-gradient-to-t from-ink/70 via-transparent"}`}
                  >
                    <button
                      onClick={() => toggleFavorite(img)}
                      className="pointer-events-auto btn bg-white px-3 py-2 text-ink hover:bg-canvas"
                      aria-label={img.is_favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart size={16} className={img.is_favorite ? "fill-pulse text-pulse" : ""} />
                    </button>
                    <button
                      onClick={() => download(img)}
                      className="pointer-events-auto btn bg-white px-3 py-2 text-ink hover:bg-canvas"
                      aria-label="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => remove(img.id)}
                      className="pointer-events-auto btn bg-white px-3 py-2 text-red-600 hover:bg-red-50"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">{img.title}</p>
                  <p className="mt-0.5 text-xs capitalize text-muted">
                    {img.style_key.replace(/_/g, " ")} · {formatDate(img.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}