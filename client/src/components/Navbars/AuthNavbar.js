import React from "react";
import {
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Button,
} from "reactstrap";
import { Link, NavLink as RRNavLink } from "react-router-dom";
import { useAuthState } from "context/auth.js";

function AuthNavbar({ fixed = true, innerRef, className = "" }) {
  const { user } = useAuthState();
  const [scrolled, setScrolled] = React.useState(false);
  const [collapseOpen, setCollapseOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Navbar
      className={`cs-navbar cs-auth-navbar ${fixed ? "fixed-top" : ""} ${
        scrolled ? "cs-navbar-scrolled" : ""
      } ${className}`}
      expand="lg"
      innerRef={innerRef}
    >
      <Container>
        <div className="navbar-translate d-flex justify-content-between align-items-center w-100-mobile">
          <NavbarBrand
            tag={Link}
            to="/home"
            className="cs-navbar-brand d-flex align-items-center gap-2"
          >
            <div className="cs-brand-icon">
              <i className="fas fa-terminal"></i>
            </div>
            <span className="cs-brand-name">CodeSphere</span>
            <span className="cs-brand-pill">v2.0</span>
          </NavbarBrand>

          <button
            className={`navbar-toggler cs-toggler d-lg-none ${
              collapseOpen ? "toggled" : ""
            }`}
            onClick={() => setCollapseOpen(!collapseOpen)}
            type="button"
            aria-label="Toggle navigation"
          >
            <i className={collapseOpen ? "fas fa-times" : "fas fa-bars"}></i>
          </button>
        </div>

        <Collapse isOpen={collapseOpen} navbar className="justify-content-end">
          <Nav navbar className="align-items-lg-center gap-lg-1">
            <NavItem>
              <NavLink
                tag={RRNavLink}
                exact
                activeClassName="cs-nav-active"
                to="/home"
                className="cs-nav-link"
              >
                <i className="fas fa-home mr-1"></i> Dashboard
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={RRNavLink}
                activeClassName="cs-nav-active"
                to="/rooms/list"
                className="cs-nav-link"
              >
                <i className="fas fa-compass mr-1"></i> Explore
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={RRNavLink}
                exact
                activeClassName="cs-nav-active"
                to="/ide"
                className="cs-nav-link"
              >
                <i className="fas fa-code mr-1"></i> Cloud IDE
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={RRNavLink}
                activeClassName="cs-nav-active"
                to="/profile"
                className="cs-nav-link"
              >
                <i className="fas fa-user-circle mr-1"></i> Profile
              </NavLink>
            </NavItem>
            <NavItem className="ml-lg-2">
              <Button
                tag={Link}
                to="/logout"
                size="sm"
                color="secondary"
                outline
                className="cs-btn cs-btn-ghost text-muted py-1 px-3"
              >
                <i className="fas fa-sign-out-alt mr-1"></i> Sign Out
              </Button>
            </NavItem>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
}

export default AuthNavbar;