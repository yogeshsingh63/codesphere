import React from "react";
import { useHistory } from "react-router-dom";

import Navbar from "components/Navbars/Navbar.js";
import LoginForm from "components/Form/Login.js";
import { useAuthState } from "context/auth.js";
import asset from "utils/asset.js";

function LoginPage() {
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
      <div 
        className="page-header relative flex items-center justify-center min-h-screen py-24 bg-stone-50"
        style={{
          backgroundImage: "url(" + asset("assets/img/modern_bg_abstract.png") + ")",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-stone-900/5 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 flex justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;

