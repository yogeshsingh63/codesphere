import React from "react";
import asset from "utils/asset.js";

import { Container, Row, Col, Button } from "reactstrap";
import { Link } from "react-router-dom"; 

// core components
import Navbar from "components/Navbars/Navbar.js";
import IndexHeader from "components/Headers/IndexHeader.js";
import DarkFooter from "components/Footers/DarkFooter.js";

import SignUp from "components/Form/SignUp.js";

function Index() {
  React.useEffect(() => {
    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  });
  return (
    <>
      <Navbar />
      <div className="wrapper">
        <IndexHeader />
        <div className="main">
          <div className="section section-nucleo-icons" style={{ padding: '80px 0', background: 'white' }}>
            <Container>
              <Row className="align-items-center">
                <Col lg="6" md="12">
                  <h2 className="title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Real-time Collaboration</h2>
                  <h5 className="description" style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7 }}>
                    CodeSphere has built-in real-time collaboration, allowing you to share and edit your code with anyone! Find bugs in your code? Invite a teacher or a friend to help inspect and debug your code, in real-time.
                  </h5>
                </Col>
                <Col lg="6" md="12" className="text-center">
                  <div className="icons-container" style={{ padding: '20px' }}>
                    <img
                      alt="Real-time Collaboration"
                      src={asset("assets/img/code-collab.svg")}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                </Col>
              </Row>
              <Row className="mt-5 align-items-center">
                <Col lg="6" md="12" className="order-2 order-lg-1 text-center">
                  <div className="icons-container" style={{ padding: '20px' }}>
                    <img
                      alt="Custom Courses & Challenges"
                      src={asset("assets/img/code-version-control.svg")}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                </Col>
                <Col lg="6" md="12" className="order-1 order-lg-2">
                  <h2 className="title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Custom Courses & Challenges</h2>
                  <h5 className="description" style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7 }}>
                    CodeSphere has support for teachers and content-creators to add custom courses & challenges that can be shared with their students. Using our built-in markdown editor and course creator, producing a coding curriculum is incredibly easy!
                  </h5>
                </Col>
              </Row>
            </Container>
          </div>
          <div className="section" style={{ padding: '80px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Container className="text-center">
              <Row className="justify-content-md-center">
                <Col lg="8" md="12">
                  <h2 className="title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>Join Today</h2>
                  <h5 className="description" style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7, marginBottom: '32px' }}>
                    Want to learn to code? No better day than today to start! Get the ability to code right in your browser and collaborate with others by signing up now!
                  </h5>
                </Col>
              </Row>
              <Button
                  color="primary"
                  to="/register"
                  role="button"
                  size="lg"
                  tag={Link}
                  style={{ fontWeight: 600, borderRadius: '10px', padding: '12px 32px' }}
              >
                Register
              </Button>
              <Button
                  outline
                  color="primary"
                  to="/login"
                  role="button"
                  size="lg"
                  tag={Link}
                  style={{ fontWeight: 600, borderRadius: '10px', padding: '12px 32px', marginLeft: '12px' }}
              >
                Login
              </Button>
            </Container> 
          </div>
        </div>
        <div
          className="section section-signup"
          id="signup"
          style={{
            background: '#f8fafc',
            padding: '80px 0',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Container>
            <Row className="justify-content-center">
              <Col md="6" lg="5">
                <SignUp />
              </Col>
            </Row>
          </Container>
        </div>
        <DarkFooter />
      </div>
    </>
  );
}

export default Index;
