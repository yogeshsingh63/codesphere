import React from "react";
import { Link } from "react-router-dom";
import Navbar from "components/Navbars/Navbar.js";
import Footer from "components/Footers/Footer.js";

export default function NotFoundPage() {
  React.useEffect(() => {
    document.title = "Page not found — CodeSphere";
  }, []);

  return (
    <>
      <a href="#main" className="cs-skip-link">Skip to content</a>
      <Navbar />
      <main id="main" className="min-h-screen bg-[var(--cs-surface)] pt-16 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center bg-[var(--cs-surface-elevated)] border border-[var(--cs-border)] rounded-3xl p-10 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--cs-brand)] mb-3">404</p>
          <h1 className="text-2xl font-extrabold text-[var(--cs-ink)] tracking-tight mb-3">Page not found</h1>
          <p className="text-sm text-[var(--cs-ink-muted)] leading-relaxed mb-8">
            The page you are looking for does not exist or was moved.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[var(--cs-brand)] hover:bg-[var(--cs-brand-hover)] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Go home
            </Link>
            <Link
              to="/home"
              className="inline-flex items-center gap-2 border border-[var(--cs-border)] text-[var(--cs-ink)] hover:bg-black/5 dark:hover:bg-white/5 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
