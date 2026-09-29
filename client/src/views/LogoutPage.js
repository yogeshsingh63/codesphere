import React from "react";
import { Redirect } from "react-router-dom";
import { useAuthState } from "context/auth.js";

function LogoutPage() {
  const { signOut } = useAuthState();

  React.useEffect(() => {
    signOut();
  }, [signOut]);

  return <Redirect to="/login" />;
}

export default LogoutPage;
