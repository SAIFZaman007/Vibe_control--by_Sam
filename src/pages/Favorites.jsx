import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartOff } from "lucide-react";
import { api, assetUrl } from "../api/client";

export default function Favorites() {
  const [styles, setStyles] = useState([]);
  const [favKeys, setFavKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/api/styles"), api.get("/api/favorites")])
      .then(([s, f]) => {
        setStyles(s.data);
        setFavKeys(f.data.map((x) => x.style_key));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const remove = async (key) => {
    setFavKeys((prev) => prev.filter((k) => k !== key));
    try {
      await api.delete(`/api/favorites/${key}`);
    } catch {
      setFavKeys((prev) => [...prev, key]);
    }
  };

  const favStyles = styles.filter((s) => favKeys.includes(s.key));

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">Favorites</h1>
        <p className="mt-1 text-muted">The vibes you've saved for quick access.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : favStyles.length === 0 ? (
        <div className="card grid place-items-center py-20 text-center">
          <HeartOff className="mb-3 text-muted opacity-40" size={40} />
          <h2 className="text-lg font-bold">No favorites yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            In the studio, tap the ♥ on any vibe to save it here.
          </p>
          <Link to="/studio" className="btn-primary mt-6">Explore vibes</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {favStyles.map((s) => (
            <div key={s.key} className="card overflow-hidden">
              <img
                src={assetUrl(s.thumbnail_url)}
                alt={s.name}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-3">
                <p className="text-sm font-semibold">{s.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{s.description}</p>
                <div className="mt-3 flex gap-2">
                  <Link to="/studio" className="btn-subtle flex-1 py-2 text-xs">Use in studio</Link>
                  <button onClick={() => remove(s.key)} className="btn-ghost py-2 text-xs" aria-label="Remove favorite">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
