import React from "react";
import {
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Button
} from "reactstrap";

import { NavLink as RRNavLink, Link } from 'react-router-dom';

function IndexNavbar({ transparent = true, fixed = true, innerRef, className }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [collapseOpen, setCollapseOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClasses = [
    fixed ? "fixed-top" : "",
    transparent && !scrolled ? "navbar-transparent" : "",
    className || ""
  ].filter(Boolean).join(" ");

  return (
    <>
      {collapseOpen && (
        <div
          id="bodyClick"
          onClick={() => {
            document.documentElement.classList.toggle("nav-open");
            setCollapseOpen(false);
          }}
        />
      )}
      <Navbar className={navClasses} expand="lg" color="white">
        <Container>
          <NavbarBrand tag={RRNavLink} to="/" id="navbar-brand">
            <i className="fas fa-code me-2" style={{ marginRight: '8px', color: '#6366f1' }}></i>
            CodeSphere
          </NavbarBrand>
          <button
            className="navbar-toggler"
            onClick={() => {
              document.documentElement.classList.toggle("nav-open");
              setCollapseOpen(!collapseOpen);
            }}
            aria-expanded={collapseOpen}
            type="button"
          >
            <span className="navbar-toggler-bar top-bar"></span>
            <span className="navbar-toggler-bar middle-bar"></span>
            <span className="navbar-toggler-bar bottom-bar"></span>
          </button>
          <Collapse className="justify-content-end" isOpen={collapseOpen} navbar>
            <Nav navbar>
              <NavItem>
                <NavLink tag={RRNavLink} exact activeClassName="active" to="/register">
                  Register
                </NavLink>
              </NavItem>
              <NavItem>
                <Button tag={Link} to="/login" color="primary" size="sm" className="ms-2" style={{ marginLeft: '8px' }}>
                  <i className="fas fa-sign-in-alt me-1" style={{ marginRight: '6px' }}></i>
                  Login
                </Button>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default IndexNavbar;