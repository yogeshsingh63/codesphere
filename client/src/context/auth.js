import React from 'react';
import fetch from "utils/fetch.js";
import Cookies from 'universal-cookie';

const AuthContext = React.createContext({
  status: 'pending',
  error: null,
  data: null,
  refresh: async () => false,
  signOut: () => {},
});

function readCachedAuth() {
  const cookies = new Cookies();
  try {
    if (sessionStorage.auth) {
      const data = JSON.parse(sessionStorage.auth);
      if (data.time && data.time + 1000 * 60 * 15 > +new Date() && data.token === cookies.get("authToken")) {
        return data;
      }
      sessionStorage.removeItem("auth");
    }
  } catch {
    try { sessionStorage.removeItem("auth"); } catch {}
  }
  return null;
}

function AuthProvider({children}) {
  const [state, setState] = React.useState({
    status: 'pending',
    error: null,
    data: null,
  });

  const validate = React.useCallback(async () => {
    const cookies = new Cookies();
    const cached = readCachedAuth();
    if (cached) {
      setState({ status: 'success', error: null, data: cached });
      return true;
    }
    if (!cookies.get("authToken")) {
      try { sessionStorage.removeItem("auth"); } catch {}
      try { sessionStorage.removeItem("rooms"); } catch {}
      setState({ status: 'error', error: null, data: { isSignedIn: false } });
      return false;
    }
    try {
      const resp = await fetch(process.env.REACT_APP_API_URL + "/user/auth", {
        method: "POST"
      });
      const json = await resp.json();
      if (json.success) {
        const data = {
          isSignedIn: true,
          user: json.response.username,
          email: json.response.email,
          time: +new Date(),
          token: cookies.get("authToken")
        };
        setState({ status: 'success', error: null, data });
        try { sessionStorage.auth = JSON.stringify(data); } catch {}
        return true;
      }
      setState({ status: 'error', error: json.response, data: { isSignedIn: false } });
      return false;
    } catch {
      setState({ status: 'error', error: 'Network error', data: { isSignedIn: false } });
      return false;
    }
  }, []);

  React.useEffect(() => {
    validate();
  }, [validate]);

  const signOut = React.useCallback(() => {
    const cookies = new Cookies();
    try { cookies.remove("authToken", { path: "/" }); } catch {}
    try { sessionStorage.removeItem("auth"); } catch {}
    try { sessionStorage.removeItem("rooms"); } catch {}
    setState({ status: 'error', error: null, data: { isSignedIn: false } });
  }, []);

  const value = React.useMemo(() => ({
    ...state,
    refresh: validate,
    signOut,
  }), [state, validate, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {state.status === 'pending' ? (
        <div className="flex min-h-screen items-center justify-center bg-[var(--cs-surface)]" role="status" aria-label="Loading CodeSphere">
          <style>{`@keyframes cs-spin { to { transform: rotate(360deg); } }`}</style>
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--cs-border)] bg-[var(--cs-surface-elevated)] px-5 py-4 shadow-sm">
            <span aria-hidden="true" className="inline-block h-5 w-5 rounded-full border-2 border-black/15 border-t-[var(--cs-brand)] dark:border-white/15" style={{ animation: 'cs-spin 0.9s linear infinite' }} />
            <span className="text-sm font-semibold text-[var(--cs-ink-muted)]">Loading CodeSphere…</span>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  )
}

function useAuthState(forceUpdate = false) {
  const ctx = React.useContext(AuthContext);
  const cookies = new Cookies();
  if(forceUpdate && sessionStorage.auth) {
    try { sessionStorage.removeItem("auth"); } catch {}
  }

  if(!cookies.get("authToken")) {
    return {
      status: ctx.status === 'pending' ? 'pending' : "error",
      isSignedIn: false,
      refresh: ctx.refresh,
      signOut: ctx.signOut,
    }
  }

  return {
    status: ctx.status,
    ...(ctx.data || { isSignedIn: false }),
    refresh: ctx.refresh,
    signOut: ctx.signOut,
  }
}

export { AuthProvider, useAuthState };