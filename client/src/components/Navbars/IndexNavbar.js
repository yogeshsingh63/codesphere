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
import asset from "utils/asset.js";

function IndexNavbar({ fixed = true, innerRef, className = "" }) {
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
      className={`cs-navbar ${fixed ? "fixed-top" : ""} ${
        scrolled ? "cs-navbar-scrolled" : ""
      } ${className}`}
      expand="lg"
      innerRef={innerRef}
    >
      <Container>
        <div className="navbar-translate d-flex justify-content-between align-items-center w-100-mobile">
          <NavbarBrand
            tag={Link}
            to="/"
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
          <Nav navbar className="align-items-lg-center gap-lg-2">
            <NavItem>
              <NavLink tag={Link} to="/rooms/list" className="cs-nav-link">
                <i className="fas fa-compass mr-1"></i> Explore
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/login" className="cs-nav-link">
                Sign In
              </NavLink>
            </NavItem>
            <NavItem>
              <Button
                tag={Link}
                to="/register"
                size="sm"
                color="info"
                className="cs-btn cs-btn-info ml-lg-2"
              >
                Get Started Free &rarr;
              </Button>
            </NavItem>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
}

export default IndexNavbar;