import React from "react";
import { Link, NavLink as RRNavLink } from "react-router-dom";
import ThemeToggle from "components/Navbars/ThemeToggle.js";
import Logo from "components/Brand/Logo.js";

const linkBase =
  "text-[var(--cs-ink-muted)] hover:text-[var(--cs-ink)] font-medium transition-colors text-sm flex items-center gap-1.5";
const linkActive = "text-[var(--cs-brand)]";

function AuthNavbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav aria-label="Primary" className="fixed top-0 left-0 right-0 h-16 z-50 backdrop-blur-md bg-[var(--cs-surface-elevated)]/80 border-b border-[var(--cs-border)] flex items-center transition-colors duration-300">
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 text-[var(--cs-ink)] font-bold text-lg hover:opacity-90 transition-opacity" aria-label="CodeSphere home">
          <Logo size={28} />
          <span>CodeSphere</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <RRNavLink
            exact
            to="/home"
            className={linkBase}
            activeClassName={linkActive}
          >
            <i className="fas fa-home text-xs" aria-hidden="true"></i>
            <span>Home</span>
          </RRNavLink>
          <RRNavLink
            to="/profile"
            className={linkBase}
            activeClassName={linkActive}
          >
            <i className="fas fa-user text-xs" aria-hidden="true"></i>
            <span>Profile</span>
          </RRNavLink>
          <RRNavLink
            to="/rooms/list"
            className={linkBase}
            activeClassName={linkActive}
          >
            <i className="fas fa-layer-group text-xs" aria-hidden="true"></i>
            <span>Rooms</span>
          </RRNavLink>
          <RRNavLink
            to="/ide"
            className={linkBase}
            activeClassName={linkActive}
          >
            <i className="fas fa-code text-xs" aria-hidden="true"></i>
            <span>IDE</span>
          </RRNavLink>
          <ThemeToggle />
          <Link
            to="/logout"
            className="flex items-center gap-2 bg-[var(--cs-brand)] hover:bg-[var(--cs-brand-hover)] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors hover:shadow-md"
          >
            <i className="fas fa-sign-out-alt text-xs" aria-hidden="true"></i>
            <span>Logout</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="text-[var(--cs-ink-muted)] hover:text-[var(--cs-ink)] focus:outline-none p-2"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            <i className={`fas ${isOpen ? "fa-times" : "fa-bars"} text-xl`} aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[var(--cs-surface-elevated)] border-b border-[var(--cs-border)] p-6 flex flex-col gap-4 shadow-lg md:hidden">
          <RRNavLink
            exact
            to="/home"
            onClick={() => setIsOpen(false)}
            className="text-[var(--cs-ink-muted)] hover:text-[var(--cs-ink)] font-medium py-2 border-b border-[var(--cs-border)] transition-colors text-base flex items-center gap-2"
            activeClassName={linkActive}
          >
            <i className="fas fa-home" aria-hidden="true"></i>
            <span>Home</span>
          </RRNavLink>
          <RRNavLink
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="text-[var(--cs-ink-muted)] hover:text-[var(--cs-ink)] font-medium py-2 border-b border-[var(--cs-border)] transition-colors text-base flex items-center gap-2"
            activeClassName={linkActive}
          >
            <i className="fas fa-user" aria-hidden="true"></i>
            <span>Profile</span>
          </RRNavLink>
          <RRNavLink
            to="/rooms/list"
            onClick={() => setIsOpen(false)}
            className="text-[var(--cs-ink-muted)] hover:text-[var(--cs-ink)] font-medium py-2 border-b border-[var(--cs-border)] transition-colors text-base flex items-center gap-2"
            activeClassName={linkActive}
          >
            <i className="fas fa-layer-group" aria-hidden="true"></i>
            <span>Rooms</span>
          </RRNavLink>
          <RRNavLink
            to="/ide"
            onClick={() => setIsOpen(false)}
            className="text-[var(--cs-ink-muted)] hover:text-[var(--cs-ink)] font-medium py-2 border-b border-[var(--cs-border)] transition-colors text-base flex items-center gap-2"
            activeClassName={linkActive}
          >
            <i className="fas fa-code" aria-hidden="true"></i>
            <span>IDE</span>
          </RRNavLink>
          <Link
            to="/logout"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 bg-[var(--cs-brand)] hover:bg-[var(--cs-brand-hover)] text-white py-3 rounded-lg text-base font-semibold shadow-sm transition-colors"
          >
            <i className="fas fa-sign-out-alt" aria-hidden="true"></i>
            <span>Logout</span>
          </Link>
        </div>
      )}
    </nav>
  );
}

export default AuthNavbar;