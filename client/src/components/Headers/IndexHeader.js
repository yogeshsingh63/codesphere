import React from "react";
import asset from "utils/asset.js";
import { Link } from "react-router-dom";
import { useAuthState } from "context/auth.js";

function IndexHeader() {
  const { isSignedIn } = useAuthState();

  return (
    <div
      className="relative flex items-center justify-center min-h-[90vh] overflow-hidden py-20 mt-16"
      style={{
        backgroundImage: "url(" + asset("assets/img/modern_bg_abstract.png") + ")",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 flex justify-center">
        <div className="w-full max-w-2xl bg-white/75 backdrop-blur-xl border border-white/45 rounded-3xl p-10 md:p-14 text-center shadow-xl flex flex-col items-center">
          <img
            alt="CodeSphere"
            className="w-16 h-16 mx-auto mb-6 object-contain"
            src={asset("assets/img/favicon.png")}
          />
          <h1 className="text-stone-900 text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            CodeSphere
          </h1>
          <p className="text-stone-600 text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto mb-6">
            An interactive workspace for collaborative coding, real-time pair programming, and cohort-based teaching.
          </p>
          {isSignedIn ? (
            <Link
              to="/home"
              className="inline-flex items-center gap-2 bg-[#c2410c] hover:bg-[#a13207] text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-all duration-200"
            >
              Go to Dashboard &rarr;
            </Link>
          ) : (
            <a
              href="#signup"
              className="inline-block bg-stone-900 text-white hover:bg-stone-800 font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-md"
            >
              Get Started &darr;
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default IndexHeader;

