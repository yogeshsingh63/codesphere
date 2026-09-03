import React from "react";

import { useHistory } from "react-router-dom";
import { useAuthState } from "context/auth.js";

function LogoutPage() {
  const history = useHistory();
  const { signOut } = useAuthState();

  React.useEffect(() => {
    signOut();
    history.replace("/");
  }, [history, signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cs-surface)]" role="status" aria-label="Logging out">
      <p className="text-sm text-[var(--cs-ink-muted)]">Logging out…</p>
    </div>
  );
}

export default LogoutPage;
