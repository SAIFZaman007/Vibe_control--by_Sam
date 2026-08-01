import { useEffect, useState } from "react";
import { api } from "../api/client";

/**
 * Protected images are served from ownership-checked API endpoints that require
 * the Authorization header, so a plain <img src> can't load them. This component
 * fetches the bytes via the authed axios client and renders an object URL.
 */
export default function AuthImage({ path, alt = "", className = "" }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl;
    let active = true;
    setSrc(null);
    setFailed(false);

    api
      .get(path, { responseType: "blob" })
      .then((res) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => active && setFailed(true));

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  if (failed) {
    return (
      <div className={`grid place-items-center bg-ink/5 text-xs text-muted ${className}`}>
        Unavailable
      </div>
    );
  }
  if (!src) return <div className={`skeleton ${className}`} aria-hidden="true" />;

  return <img src={src} alt={alt} className={className} loading="lazy" />;
}
