import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-vibe-gradient text-white">
        <Sparkles size={16} />
      </span>
      <span className="font-display text-lg font-extrabold">
        Vibe<span className="text-vibe-gradient">Control</span>
      </span>
    </Link>
  );
}

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? "text-ink" : "text-muted hover:text-ink"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const authedLinks = (
    <>
      <NavLink to="/studio" className={linkClass} onClick={() => setOpen(false)}>
        Studio
      </NavLink>
      <NavLink to="/gallery" className={linkClass} onClick={() => setOpen(false)}>
        Gallery
      </NavLink>
      <NavLink to="/favorites" className={linkClass} onClick={() => setOpen(false)}>
        Favorites
      </NavLink>
      <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>
        Profile
      </NavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Wordmark />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {user ? (
            <>
              {authedLinks}
              <button onClick={handleLogout} className="btn-subtle">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted hover:text-ink">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-line bg-canvas md:hidden">
          <div className="container-page flex flex-col gap-4 py-5">
            {user ? (
              <>
                {authedLinks}
                <button onClick={handleLogout} className="btn-subtle w-full">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="btn-primary w-full" onClick={() => setOpen(false)}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
