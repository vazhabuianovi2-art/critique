import React from "react";

export function BrandBolt({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bb-bg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4c1d95" />
          <stop offset="1" stopColor="#720cb0" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="36" height="36" rx="10" fill="url(#bb-bg)" />

      {/* Outer dashed ring — slow rotation */}
      <g>
        <animateTransform attributeName="transform" type="rotate"
          from="0 18 18" to="360 18 18" dur="12s" repeatCount="indefinite" />
        <circle cx="18" cy="18" r="14" stroke="#c270f5" strokeOpacity="0.3"
          strokeWidth="0.8" strokeDasharray="3.5 5" fill="none" />
      </g>

      {/* Inner soft glow — breathing */}
      <circle cx="18" cy="18" r="9" fill="#9e1aef" fillOpacity="0.18">
        <animate attributeName="r" values="8;10.5;8" dur="5s" repeatCount="indefinite" />
        <animate attributeName="fill-opacity" values="0.12;0.28;0.12" dur="5s" repeatCount="indefinite" />
      </circle>

      {/* Chart line — slow draw & redraw */}
      <polyline points="9,24 13,19 17,21 22,13 27,17"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        fill="none" strokeDasharray="28" strokeDashoffset="28">
        <animate attributeName="stroke-dashoffset"
          values="28;0;0;28" keyTimes="0;0.45;0.75;1"
          dur="3.5s" repeatCount="indefinite" calcMode="spline"
          keySplines="0.4 0 0.2 1;0 0 1 1;0 0 1 1" />
      </polyline>

      {/* Arrow tip — fades in with line */}
      <polyline points="23.5,12.5 27,12.5 27,16"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        fill="none" opacity="0">
        <animate attributeName="opacity"
          values="0;0;1;1;0" keyTimes="0;0.4;0.5;0.75;1"
          dur="3.5s" repeatCount="indefinite" />
      </polyline>
    </svg>
  );
}
