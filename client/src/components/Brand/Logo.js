import React from "react";
import asset from "utils/asset.js";

export default function Logo({ size = 28, className = "", alt = "CodeSphere logo" }) {
  return (
    <img
      src={asset("assets/img/logo.svg")}
      width={size}
      height={size}
      alt={alt}
      draggable={false}
      className={`shrink-0 rounded-[28%] ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
