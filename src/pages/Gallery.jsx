import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Trash2, ImageOff, Plus } from "lucide-react";
import { api } from "../api/client";
import AuthImage from "../components/AuthImage";

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

  const download = async (img) => {
    const res = await api.get(`${img.output_url}&download=true`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibe-control-${img.style_key}-${img.id}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Gallery</h1>
          <p className="mt-1 text-muted">Everything you've created, in one place.</p>
        </div>
        <Link to="/studio" className="btn-primary shrink-0">
          <Plus size={18} /> New creation
        </Link>
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
            Head to the studio, upload a photo, and apply your first vibe.
          </p>
          <Link to="/studio" className="btn-primary mt-6">Open studio</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="card group overflow-hidden">
              <div className="relative aspect-square">
                <AuthImage path={img.output_url} alt={img.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-end justify-center gap-2 bg-gradient-to-t from-ink/70 via-transparent p-3 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => download(img)}
                    className="btn bg-white px-3 py-2 text-ink hover:bg-canvas"
                    aria-label="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => remove(img.id)}
                    className="btn bg-white px-3 py-2 text-red-600 hover:bg-red-50"
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
          ))}
        </div>
      )}
    </div>
  );
}
