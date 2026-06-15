import React from "react";
import asset from "utils/asset.js";

import { Container, Row, Col, Button } from "reactstrap";
import { Link } from "react-router-dom"; 
import { useAuthState } from "context/auth.js";

// core components
import Navbar from "components/Navbars/Navbar.js";
import IndexHeader from "components/Headers/IndexHeader.js";
import DarkFooter from "components/Footers/DarkFooter.js";

import SignUp from "components/Form/SignUp.js";

function Index() {
  const { isSignedIn } = useAuthState();

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
  }, []);
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
                  <h2 className="title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1c1917', marginBottom: '20px' }}>Interactive Shared Sandboxes</h2>
                  <h5 className="description" style={{ fontSize: '1.05rem', color: '#57534e', lineHeight: 1.7 }}>
                    CodeSphere connects creators, instructors, and developers through active terminals, allowing real-time inspection, shared editor sessions, and interactive debugging. Invite peers or instructors directly to your workspace to debug in real-time.
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
                  <h2 className="title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1c1917', marginBottom: '20px' }}>Custom Programming Curriculums</h2>
                  <h5 className="description" style={{ fontSize: '1.05rem', color: '#57534e', lineHeight: 1.7 }}>
                    Design coding challenges, author markdown tutorials, and organize coding sections. CodeSphere offers robust toolsets to launch, share, and track custom programming paths for groups or classrooms.
                  </h5>
                </Col>
              </Row>
            </Container>
          </div>
          <div className="section" style={{ padding: '80px 0', background: '#faf9f6', borderTop: '1px solid #e7e5e4' }}>
            <Container className="text-center">
              <Row className="justify-content-md-center">
                <Col lg="8" md="12">
                  <h2 className="title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1c1917', marginBottom: '20px' }}>
                    {isSignedIn ? "Your Workspace is Ready" : "Set Up Your Collaborative Room"}
                  </h2>
                  <h5 className="description" style={{ fontSize: '1.05rem', color: '#78716c', lineHeight: 1.7, marginBottom: '32px' }}>
                    {isSignedIn
                      ? "Continue building challenges, collaborating with peers, or managing your coding classrooms from your dashboard."
                      : "Create an interactive space in seconds. Author coding rooms, pair-program with peers, and tackle programming challenges together in the browser."}
                  </h5>
                </Col>
              </Row>
              {isSignedIn ? (
                <Button
                  color="primary"
                  to="/home"
                  role="button"
                  size="lg"
                  tag={Link}
                  style={{ fontWeight: 600, borderRadius: '10px', padding: '12px 32px', background: '#c2410c', borderColor: '#c2410c', color: 'white' }}
                >
                  Go to Dashboard &rarr;
                </Button>
              ) : (
                <>
                  <Button
                      color="primary"
                      to="/register"
                      role="button"
                      size="lg"
                      tag={Link}
                      style={{ fontWeight: 600, borderRadius: '10px', padding: '12px 32px', background: '#c2410c', borderColor: '#c2410c', color: 'white' }}
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
                      style={{ fontWeight: 600, borderRadius: '10px', padding: '12px 32px', marginLeft: '12px', color: '#c2410c', borderColor: '#c2410c' }}
                  >
                    Login
                  </Button>
                </>
              )}
            </Container> 
          </div>
        </div>
        {!isSignedIn && (
          <div
            className="section section-signup"
            id="signup"
            style={{
              background: '#faf9f6',
              padding: '80px 0',
              borderTop: '1px solid #e7e5e4',
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
        )}
        <DarkFooter />
      </div>
    </>
  );
}

export default Index;
