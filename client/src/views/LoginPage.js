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
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    if (isSignedIn) history.replace("/home");
  }, [isSignedIn, history]);

  if(isSignedIn) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main
        id="main"
        className="relative flex items-center justify-center min-h-screen py-24 bg-[var(--cs-surface)]"
        style={{
          backgroundImage: "url(" + asset("assets/img/modern_bg_abstract.png") + ")",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/5 dark:bg-black/40 pointer-events-none" aria-hidden="true" />
        <div className="container mx-auto px-6 relative z-10 flex justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </main>
    </>
  );
}

export default LoginPage;

