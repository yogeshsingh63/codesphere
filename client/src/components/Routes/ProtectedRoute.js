import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuthState } from "context/auth.js";
import { Spinner } from "reactstrap";

export default function ProtectedRoute({ component: Component, render, ...rest }) {
  const { isSignedIn, status } = useAuthState();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (status === "pending") {
          return (
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#080c14",
              }}
            >
              <Spinner color="info" />
            </div>
          );
        }

        if (!isSignedIn) {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location },
              }}
            />
          );
        }

        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
}
