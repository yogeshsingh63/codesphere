import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

function DefaultFooter() {
  return (
    <footer className="cs-footer py-4 border-top border-dark">
      <Container>
        <Row className="align-items-center">
          <Col md="6" className="text-center text-md-left mb-3 mb-md-0">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
              <span className="cs-brand-icon-sm mr-2">
                <i className="fas fa-terminal"></i>
              </span>
              <span className="font-weight-600 text-white mr-2">CodeSphere</span>
              <span className="text-muted small">
                &bull; &copy; {new Date().getFullYear()} Yogesh Singh. Open-source under MIT.
              </span>
            </div>
          </Col>
          <Col md="6" className="text-center text-md-right">
            <div className="d-flex align-items-center justify-content-center justify-content-md-end gap-3 small">
              <Link to="/rooms/list" className="text-muted mr-3">
                Explore Rooms
              </Link>
              <Link to="/ide" className="text-muted mr-3">
                Cloud IDE
              </Link>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/yogeshsingh63/codesphere"
                className="text-info font-weight-500"
              >
                <i className="fab fa-github mr-1"></i> GitHub
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default DefaultFooter;
