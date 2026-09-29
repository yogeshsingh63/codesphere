import React from "react";
import { Container, Row, Col } from "reactstrap";
import Navbar from "components/Navbars/Navbar.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";
import Login from "components/Form/Login.js";

function LoginPage() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div
        className="wrapper d-flex flex-column justify-content-between"
        style={{
          minHeight: "100vh",
          backgroundColor: "#080c14",
          color: "#f8fafc",
        }}
      >
        <div style={{ height: "4.5rem" }} />
        <Container className="my-auto py-5">
          <Row className="justify-content-center">
            <Col lg="5" md="7" sm="10">
              <Login />
            </Col>
          </Row>
        </Container>
        <DefaultFooter />
      </div>
    </>
  );
}

export default LoginPage;
