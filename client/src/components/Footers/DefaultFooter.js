import React from "react";

import { Container, Row, Col } from "reactstrap";

function DefaultFooter() {
  return (
    <footer className="footer footer-default">
      <Container>
        <Row className="align-items-center">
          <Col>
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/yogeshsingh63/CodeSphere">
              <i className="fab fa-github" style={{ color: '#64748b', fontSize: '1.25rem' }}></i>
            </a>
          </Col>
          <Col className="copyright text-right" id="copyright">
            © {new Date().getFullYear()} CodeSphere
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default DefaultFooter;
