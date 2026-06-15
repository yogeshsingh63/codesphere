import React from "react";
import { Link, NavLink as RRNavLink } from "react-router-dom";

function AuthNavbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-50 backdrop-blur-md bg-stone-50/80 border-b border-stone-200/50 flex items-center transition-all duration-300">
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 text-stone-900 font-bold text-lg hover:opacity-90 transition-opacity">
          <i className="fas fa-code" style={{ color: '#c2410c' }}></i>
          <span>CodeSphere</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <RRNavLink
            exact
            to="/home"
            className="text-stone-600 hover:text-stone-900 font-medium transition-colors text-sm flex items-center gap-1.5"
            activeClassName="text-[#c2410c]!"
          >
            <i className="fas fa-home text-xs"></i>
            <span>Home</span>
          </RRNavLink>
          <RRNavLink
            to="/profile"
            className="text-stone-600 hover:text-stone-900 font-medium transition-colors text-sm flex items-center gap-1.5"
            activeClassName="text-[#c2410c]!"
          >
            <i className="fas fa-user text-xs"></i>
            <span>Profile</span>
          </RRNavLink>
          <RRNavLink
            to="/rooms/list"
            className="text-stone-600 hover:text-stone-900 font-medium transition-colors text-sm flex items-center gap-1.5"
            activeClassName="text-[#c2410c]!"
          >
            <i className="fas fa-layer-group text-xs"></i>
            <span>Rooms</span>
          </RRNavLink>
          <RRNavLink
            to="/ide"
            className="text-stone-600 hover:text-stone-900 font-medium transition-colors text-sm flex items-center gap-1.5"
            activeClassName="text-[#c2410c]!"
          >
            <i className="fas fa-code text-xs"></i>
            <span>IDE</span>
          </RRNavLink>
          <Link
            to="/logout"
            className="flex items-center gap-2 bg-[#c2410c] hover:bg-[#a13207] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all hover:shadow-md"
          >
            <i className="fas fa-sign-out-alt text-xs"></i>
            <span>Logout</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="md:hidden text-stone-600 hover:text-stone-900 focus:outline-none p-2"
          aria-label="Toggle Menu"
        >
          <i className={`fas ${isOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-stone-50 border-b border-stone-200/50 p-6 flex flex-col gap-4 shadow-lg md:hidden animate-fade-in">
          <RRNavLink
            exact
            to="/home"
            onClick={() => setIsOpen(false)}
            className="text-stone-600 hover:text-stone-900 font-medium py-2 border-b border-stone-100 transition-colors text-base flex items-center gap-2"
            activeClassName="text-[#c2410c]"
          >
            <i className="fas fa-home"></i>
            <span>Home</span>
          </RRNavLink>
          <RRNavLink
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="text-stone-600 hover:text-stone-900 font-medium py-2 border-b border-stone-100 transition-colors text-base flex items-center gap-2"
            activeClassName="text-[#c2410c]"
          >
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </RRNavLink>
          <RRNavLink
            to="/rooms/list"
            onClick={() => setIsOpen(false)}
            className="text-stone-600 hover:text-stone-900 font-medium py-2 border-b border-stone-100 transition-colors text-base flex items-center gap-2"
            activeClassName="text-[#c2410c]"
          >
            <i className="fas fa-layer-group"></i>
            <span>Rooms</span>
          </RRNavLink>
          <RRNavLink
            to="/ide"
            onClick={() => setIsOpen(false)}
            className="text-stone-600 hover:text-stone-900 font-medium py-2 border-b border-stone-100 transition-colors text-base flex items-center gap-2"
            activeClassName="text-[#c2410c]"
          >
            <i className="fas fa-code"></i>
            <span>IDE</span>
          </RRNavLink>
          <Link
            to="/logout"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 bg-[#c2410c] hover:bg-[#a13207] text-white py-3 rounded-lg text-base font-semibold shadow-sm transition-all"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </Link>
        </div>
      )}
    </nav>
  );
}

export default AuthNavbar;