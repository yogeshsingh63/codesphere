import React from "react";
import asset from "utils/asset.js";
import { Container } from "reactstrap";

function IndexHeader() {
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
        <div className="w-full max-w-2xl bg-white/75 backdrop-blur-xl border border-white/45 rounded-3xl p-10 md:p-14 text-center shadow-xl">
          <img
            alt="CodeSphere"
            className="w-16 h-16 mx-auto mb-6 object-contain"
            src={asset("assets/img/favicon.png")}
          />
          <h1 className="text-stone-900 text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            CodeSphere
          </h1>
          <h3 className="text-stone-600 text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto">
            A collaborative space to learn, build, and teach coding in real-time, right from your browser.
          </h3>
        </div>
      </Container>
    </div>
  );
}

export default IndexHeader;
