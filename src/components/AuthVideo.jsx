import { useEffect, useState } from "react";
import { api } from "../api/client";

/**
 * Like AuthImage, but for video. Protected media is served from ownership-checked
 * API endpoints that require the Authorization header, so a plain <video src> can't
 * load them. This fetches the bytes via the authed axios client and plays an object
 * URL. (The whole file is fetched before playback — fine for the short clips we cap
 * uploads to; a range-request/streaming endpoint would be the next step for long video.)
 */
export default function AuthVideo({
  path,
  className = "",
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
}) {
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

  return (
    <video
      src={src}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      preload="metadata"
    />
  );
}