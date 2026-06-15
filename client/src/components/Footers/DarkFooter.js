import React from "react";

import { Container, Row, Col } from "reactstrap";

function DarkFooter() {
  return (
    <footer className="footer" style={{ backgroundColor: '#0f172a', borderTop: 'none' }}>
      <Container>
        <Row className="align-items-center">
          <Col>
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/yogeshsingh63/CodeSphere">
              <i className="fab fa-github" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.25rem' }}></i>
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

export default DarkFooter;
