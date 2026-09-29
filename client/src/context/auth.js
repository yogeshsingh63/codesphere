import React from "react";
import Cookies from "universal-cookie";
import fetch from "utils/fetch.js";
import { Spinner } from "reactstrap";

const AuthContext = React.createContext({
  status: "pending",
  isSignedIn: false,
  user: null,
  email: null,
  token: null,
  loginSuccess: () => {},
  signOut: () => {},
  refreshAuth: () => {},
});

function AuthProvider({ children }) {
  const [state, setState] = React.useState({
    status: "pending",
    error: null,
    data: {
      isSignedIn: false,
      user: null,
      email: null,
      token: null,
    },
  });

  const checkAuth = React.useCallback(() => {
    const cookies = new Cookies();
    const token = cookies.get("authToken");

    if (!token) {
      sessionStorage.removeItem("auth");
      setState({
        status: "success",
        error: null,
        data: { isSignedIn: false, user: null, email: null, token: null },
      });
      return;
    }

    if (sessionStorage.auth) {
      try {
        const cached = JSON.parse(sessionStorage.auth);
        if (
          cached.time &&
          cached.time + 1000 * 60 * 15 > +new Date() &&
          cached.token === token
        ) {
          setState({
            status: "success",
            error: null,
            data: {
              isSignedIn: true,
              user: cached.user,
              email: cached.email,
              token: cached.token,
            },
          });
          return;
        } else {
          sessionStorage.removeItem("auth");
        }
      } catch (err) {
        sessionStorage.removeItem("auth");
      }
    }

    fetch(process.env.REACT_APP_API_URL + "/user/auth", {
      method: "POST",
    })
      .then((resp) => resp.json())
      .then((json) => {
        if (json.success && json.response?.isSignedIn) {
          const authData = {
            isSignedIn: true,
            user: json.response.username,
            email: json.response.email,
            time: +new Date(),
            token: cookies.get("authToken"),
          };
          sessionStorage.auth = JSON.stringify(authData);
          setState({
            status: "success",
            error: null,
            data: {
              isSignedIn: true,
              user: json.response.username,
              email: json.response.email,
              token: authData.token,
            },
          });
        } else {
          cookies.remove("authToken");
          sessionStorage.removeItem("auth");
          setState({
            status: "success",
            error: json.response || "Unauthorized",
            data: { isSignedIn: false, user: null, email: null, token: null },
          });
        }
      })
      .catch(() => {
        setState({
          status: "success",
          error: "Network error",
          data: { isSignedIn: false, user: null, email: null, token: null },
        });
      });
  }, []);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginSuccess = React.useCallback((token, username, email) => {
    const cookies = new Cookies();
    cookies.set("authToken", token, { path: "/", maxAge: 86400 });
    const authData = {
      isSignedIn: true,
      user: username,
      email: email,
      time: +new Date(),
      token: token,
    };
    sessionStorage.auth = JSON.stringify(authData);
    setState({
      status: "success",
      error: null,
      data: {
        isSignedIn: true,
        user: username,
        email: email,
        token: token,
      },
    });
  }, []);

  const signOut = React.useCallback(() => {
    const cookies = new Cookies();
    cookies.remove("authToken", { path: "/" });
    sessionStorage.removeItem("auth");
    setState({
      status: "success",
      error: null,
      data: { isSignedIn: false, user: null, email: null, token: null },
    });
  }, []);

  const contextValue = React.useMemo(
    () => ({
      status: state.status,
      error: state.error,
      ...state.data,
      loginSuccess,
      signOut,
      refreshAuth: checkAuth,
    }),
    [state, loginSuccess, signOut, checkAuth]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {state.status === "pending" ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#080c14",
            zIndex: 99999,
            gap: "1rem",
            color: "#94a3b8",
            fontFamily:
              "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <Spinner
            color="info"
            style={{ width: "3.5rem", height: "3.5rem", borderWidth: "3px" }}
          />
          <div
            style={{
              fontSize: "0.875rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "#38bdf8",
            }}
          >
            Loading CodeSphere
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

function useAuthState() {
  return React.useContext(AuthContext);
}

export { AuthProvider, useAuthState };