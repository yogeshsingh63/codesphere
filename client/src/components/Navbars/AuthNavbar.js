import React from "react";
import {
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  Nav,
  NavLink,
  Container
} from "reactstrap";

import { NavLink as RRNavLink } from 'react-router-dom';

function AuthNavbar({ transparent = true, fixed = true, innerRef, className }) {
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
      <Navbar className={navClasses} color="white" expand="lg">
        <Container>
          <NavbarBrand tag={RRNavLink} to="/" id="navbar-brand">
            <i className="fas fa-code me-2" style={{ marginRight: '8px', color: '#c2410c' }}></i>
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
                <NavLink tag={RRNavLink} exact activeClassName="active" to="/home">
                  <i className="fas fa-home me-1" style={{ marginRight: '6px' }}></i>
                  Home
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RRNavLink} exact activeClassName="active" to="/profile">
                  <i className="fas fa-user me-1" style={{ marginRight: '6px' }}></i>
                  Profile
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RRNavLink} exact activeClassName="active" to="/rooms/list">
                  <i className="fas fa-layer-group me-1" style={{ marginRight: '6px' }}></i>
                  Rooms
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RRNavLink} exact activeClassName="active" to="/ide">
                  <i className="fas fa-code me-1" style={{ marginRight: '6px' }}></i>
                  IDE
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RRNavLink} exact activeClassName="active" to="/logout">
                  <i className="fas fa-sign-out-alt me-1" style={{ marginRight: '6px' }}></i>
                  Logout
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default AuthNavbar;