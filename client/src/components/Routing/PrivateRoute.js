import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuthState } from "context/auth.js";

function LoadingGate() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cs-surface)]" role="status" aria-live="polite" aria-label="Loading">
      <div className="flex items-center gap-3 text-[var(--cs-ink-muted)]">
        <i className="fas fa-circle-notch animate-spin text-[var(--cs-brand)] text-xl" aria-hidden="true" />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  );
}

export default function PrivateRoute({ component: Component, ...rest }) {
  const { status, isSignedIn } = useAuthState();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (status === "pending" && !isSignedIn) return <LoadingGate />;
        if (!isSignedIn) {
          return <Redirect to={{ pathname: "/", state: { from: props.location } }} />;
        }
        return <Component {...props} />;
      }}
    />
  );
}
