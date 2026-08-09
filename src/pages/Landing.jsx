import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Upload, Wand2, Download, Sparkles } from "lucide-react";
import { api, assetUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";

function Hero({ styles }) {
  const { user } = useAuth();
  const primaryTo = user ? "/studio" : "/register";
  // Use a handful of generated vibe thumbnails as the hero collage.
  const tiles = styles.slice(0, 6);

  return (
    <section className="relative overflow-hidden">
      {/* Ambient gradient wash */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-vibe/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-aqua/10 blur-3xl" />

      <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <span className="eyebrow">
            <Sparkles size={13} className="text-vibe" /> Style studio
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Give any photo a<br />
            <span className="text-vibe-gradient">whole new vibe.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted">
            Upload an image or a video, pick a vibe, and restyle it in seconds.
            Save the looks you love and download in full resolution.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={primaryTo} className="btn-primary text-base">
              {user ? "Open studio" : "Start creating"} <ArrowRight size={18} />
            </Link>
            <a href="#how" className="btn-ghost text-base">
              How it works
            </a>
          </div>
          <p className="mt-4 text-xs text-muted">No credit card · Free to try · 8 built-in vibes</p>
        </div>

        {/* Vibe collage */}
        <div className="animate-fade-up [animation-delay:120ms]">
          <div className="grid grid-cols-3 gap-3">
            {tiles.map((s, i) => (
              <div
                key={s.key}
                className={`overflow-hidden rounded-2xl border border-line shadow-soft ${
                  i % 2 === 0 ? "translate-y-2" : "-translate-y-2"
                }`}
              >
                <img
                  src={assetUrl(s.thumbnail_url)}
                  alt={s.name}
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
            {tiles.length === 0 &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-2xl" />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: Upload, title: "Upload a photo or video", body: "Drop in any JPG, PNG, or MP4 up to 100 MB and 60 seconds." },
  { icon: Wand2, title: "Pick a vibe", body: "Choose a built-in style — or upload your own to transfer." },
  { icon: Download, title: "Download the result", body: "Preview before and after, then save in high resolution." },
];

function HowItWorks() {
  return (
    <section id="how" className="border-y border-line bg-surface">
      <div className="container-page py-16">
        <div className="mb-10 max-w-xl">
          <span className="eyebrow">The flow</span>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Three steps to a new look</h2>
        </div>
        <ol className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-vibe/10 text-vibe">
                  <s.icon size={20} />
                </span>
                <span className="font-display text-3xl font-extrabold text-line">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function VibeGallery({ styles }) {
  return (
    <section className="container-page py-16">
      <div className="mb-10 max-w-xl">
        <span className="eyebrow">The vibes</span>
        <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Eight looks, endless photos</h2>
        <p className="mt-3 text-muted">
          Each vibe transfers a distinct palette and texture onto your image.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {styles.map((s) => (
          <div key={s.key} className="card overflow-hidden">
            <img
              src={assetUrl(s.thumbnail_url)}
              alt={s.name}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="p-3">
              <p className="text-sm font-semibold">{s.name}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted">{s.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaBand() {
  const { user } = useAuth();
  return (
    <section className="container-page pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center text-white">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(120deg,#7c3aed_0%,#db2777_55%,#06b6d4_120%)]" />
        <div className="relative">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to restyle something?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Create a free account and turn your first photo into art in under a minute.
          </p>
          <Link
            to={user ? "/studio" : "/register"}
            className="btn mt-7 bg-white text-ink hover:-translate-y-0.5 hover:shadow-lift"
          >
            {user ? "Open studio" : "Get started free"} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const [styles, setStyles] = useState([]);

  useEffect(() => {
    api
      .get("/api/styles")
      .then((res) => setStyles(res.data))
      .catch(() => setStyles([]));
  }, []);

  return (
    <>
      <Hero styles={styles} />
      <HowItWorks />
      <VibeGallery styles={styles} />
      <CtaBand />
    </>
  );
}