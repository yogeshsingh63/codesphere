import React from "react";
import { Link } from "react-router-dom";
import { Container, Button } from "reactstrap";
import Navbar from "components/Navbars/Navbar.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <div
        className="wrapper d-flex flex-column justify-content-between"
        style={{ minHeight: "100vh", backgroundColor: "#080c14", color: "#f8fafc" }}
      >
        <div style={{ height: "4.5rem" }} />
        <Container className="text-center my-auto py-5">
          <div
            style={{
              fontSize: "6rem",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1rem",
            }}
          >
            404
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Page Not Found
          </h2>
          <p
            style={{
              color: "#94a3b8",
              maxWidth: "420px",
              margin: "0 auto 2rem auto",
              fontSize: "1rem",
            }}
          >
            The page or room you are looking for doesn't exist, was deleted, or has moved.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              tag={Link}
              to="/home"
              color="info"
              className="px-4 py-2"
              style={{ borderRadius: "10px", fontWeight: 600 }}
            >
              Back to Dashboard
            </Button>
            <Button
              tag={Link}
              to="/"
              color="secondary"
              outline
              className="px-4 py-2 ml-2"
              style={{ borderRadius: "10px", fontWeight: 600 }}
            >
              Go to Home
            </Button>
          </div>
        </Container>
        <DefaultFooter />
      </div>
    </>
  );
}
