import React from "react";
import asset from "utils/asset.js";

import { Container } from "reactstrap";

function IndexHeader() {
  return (
    <>
      <div
        className="page-header clear-filter"
        filter-color="blue"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
        <Container>
          <div className="content-center brand" style={{ position: 'relative' }}>
            <img
              alt="CodeSphere"
              className="n-logo"
              src={asset("assets/img/favicon.png")}
              style={{ maxWidth: '80px', marginBottom: '24px', opacity: 0.9 }}
            />
            <h1 className="h1-seo" style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>
              CodeSphere
            </h1>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 400, color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              An open-source, collaborative, and free learning & coding environment for all.
            </h3>
          </div>
        </Container>
      </div>
    </>
  );
}

export default IndexHeader;
