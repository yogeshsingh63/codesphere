import React from "react";
import { useHistory } from "react-router-dom";
import {
  Container,
  Col
} from "reactstrap";

import Navbar from "components/Navbars/Navbar.js";

import SignUpForm from "components/Form/SignUp.js";

import { useAuthState } from "context/auth.js";

function RegisterPage() {
  const { isSignedIn } = useAuthState();
  const history = useHistory();

  React.useEffect(() => {
    document.body.classList.add("login-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("login-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  if(isSignedIn) {
    history.push("/home");
    return <></>;
  }
  
  return (
    <>
      <Navbar />
      <div className="page-header" style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '64px'
      }}>
        <Container>
          <Col className="ml-auto mr-auto mb-5" md="5" lg="4">
            <SignUpForm />
          </Col>
        </Container>
      </div>
    </>
  );
}

export default RegisterPage;
