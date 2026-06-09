import React from 'react';
import fetch from "utils/fetch.js";
import Cookies from 'universal-cookie';
import asset from "utils/asset.js";

import { Spinner } from 'reactstrap';

const AuthContext = React.createContext();
function AuthProvider({children}) {
  const [state, setState] = React.useState({
    status: 'pending',
    error: null,
    data: null,
  });

  React.useEffect(() => {
    let cookies = new Cookies();
    if(sessionStorage.auth) {
      try {
        let data = JSON.parse(sessionStorage.auth);
        if(data.time && data.time + 1000*60*15 > +new Date() && data.token === cookies.get("authToken")) {
          setState({status: 'success', error: null, data });
          return;
        }
        else {
          sessionStorage.removeItem("auth");
        }
      }
      catch(err) {}
    }

    fetch(process.env.REACT_APP_API_URL + "/user/auth", {
       method: "POST"
    })
    .then(resp => resp.json())
    .then(json => {
      if(json.success) {
        let data = {
          isSignedIn: true,
          user: json.response.username,
          email: json.response.email,
          time: +new Date(),
          token: cookies.get("authToken")
        };
        setState({status: 'success', error: null, data });
        sessionStorage.auth = JSON.stringify(data);
      }
      else {
        setState({status: 'error', error: json.response, data: {
          isSignedIn: false
        }});
      }
    })
    .catch(() => {
      setState({status: 'error', error: 'Network error', data: {
        isSignedIn: false
      }});
    });
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {state.status === 'pending' ? (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #0b0f19 0%, #111827 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          fontFamily: "'Montserrat', sans-serif",
          color: '#ffffff',
          overflow: 'hidden'
        }}>
          <style>{`
            @keyframes pulse-glow {
              0%, 100% {
                transform: translate(-50%, -50%) scale(1);
                filter: drop-shadow(0 0 15px rgba(0, 188, 212, 0.4));
              }
              50% {
                transform: translate(-50%, -50%) scale(1.05);
                filter: drop-shadow(0 0 30px rgba(0, 188, 212, 0.8));
              }
            }
            @keyframes fade-in-up {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .loading-container {
              animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .loading-logo {
              animation: pulse-glow 3s infinite ease-in-out;
            }
          `}</style>
          <div className="loading-container" style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '3rem 2.5rem',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ position: 'relative', marginBottom: '2rem', width: '8.5rem', height: '8.5rem' }}>
              <Spinner color="info" style={{ width: '8.5rem', height: '8.5rem', borderWidth: '0.25rem' }} />
              <img 
                src={asset("assets/img/favicon.png")} 
                alt="CodeSphere Logo" 
                className="loading-logo"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '4.5rem',
                  height: '4.5rem',
                  objectFit: 'contain'
                }}
              />
            </div>
            
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              margin: '0 0 0.5rem 0',
              letterSpacing: '2px',
              background: 'linear-gradient(45deg, #00f2fe 0%, #4facfe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              CodeSphere
            </h2>
            
            <p style={{
              fontSize: '1rem',
              fontWeight: '500',
              color: '#94a3b8',
              margin: '0 0 1.5rem 0',
              maxWidth: '320px',
              lineHeight: '1.4'
            }}>
              Connecting to server...
            </p>
            
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '1.25rem',
              width: '100%'
            }}>
              <p style={{
                fontSize: '0.825rem',
                color: '#64748b',
                lineHeight: '1.6',
                margin: 0
              }}>
                Please wait while the server starts up. Deployed on Render Free Tier, which puts servers to sleep when inactive. Waking them up (cold start) may take up to a minute.
              </p>
            </div>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  )
}

function useAuthState(forceUpdate = false) {
  const state = React.useContext(AuthContext);
  const cookies = new Cookies();
  if(forceUpdate && sessionStorage.auth) {
    sessionStorage.removeItem("auth");
  }

  if(!cookies.get("authToken")) {
    return {
      status: "error",
      isSignedIn: false
    }
  }
  
  return {
    status: state.status,
    ...state.data
  }
}

export { AuthProvider, useAuthState };