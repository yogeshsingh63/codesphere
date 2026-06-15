import React from "react";
import asset from "utils/asset.js";
import { Container, Button } from "reactstrap";
import { Link } from "react-router-dom";
import { useAuthState } from "context/auth.js";

function IndexHeader() {
  const { isSignedIn } = useAuthState();

  return (
    <div
      className="relative flex items-center justify-center min-h-[90vh] overflow-hidden py-20"
      style={{
        backgroundImage: "url(" + asset("assets/img/modern_bg_abstract.png") + ")",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />

      <Container className="relative z-10 flex justify-center">
        <div className="w-full max-w-2xl bg-white/75 backdrop-blur-xl border border-white/45 rounded-3xl p-10 md:p-14 text-center shadow-xl flex flex-col items-center">
          <img
            alt="CodeSphere"
            className="w-16 h-16 mx-auto mb-6 object-contain"
            style={{ width: '64px', height: '64px', objectFit: 'contain' }}
            src={asset("assets/img/favicon.png")}
          />
          <h1 className="text-stone-900 text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            CodeSphere
          </h1>
          <h3 className="text-stone-600 text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto mb-6">
            An interactive workspace for collaborative coding, real-time pair programming, and cohort-based teaching.
          </h3>
          {isSignedIn ? (
            <Button
              tag={Link}
              to="/home"
              color="primary"
              size="lg"
              className="font-semibold px-8 py-3 rounded-xl shadow-md transition-all duration-200"
              style={{ background: '#c2410c', borderColor: '#c2410c', color: 'white' }}
            >
              Go to Dashboard &rarr;
            </Button>
          ) : (
            <a
              href="#signup"
              className="inline-block bg-stone-900 text-white hover:bg-stone-850 font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-md"
            >
              Get Started &darr;
            </a>
          )}
        </div>
      </Container>
    </div>
  );
}

export default IndexHeader;
