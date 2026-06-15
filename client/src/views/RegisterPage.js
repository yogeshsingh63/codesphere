import React from "react";
import { useHistory } from "react-router-dom";
import {
  Container,
  Col
} from "reactstrap";

import Navbar from "components/Navbars/Navbar.js";
import SignUpForm from "components/Form/SignUp.js";
import { useAuthState } from "context/auth.js";
import asset from "utils/asset.js";

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
      <div className="page-header relative flex items-center min-h-screen py-24" style={{
        backgroundImage: "url(" + asset("assets/img/modern_bg_abstract.png") + ")",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
        <Container className="relative z-10">
          <Col className="ml-auto mr-auto mb-5" md="6" lg="5" xl="4">
            <SignUpForm />
          </Col>
        </Container>
      </div>
    </>
  );
}

export default RegisterPage;
