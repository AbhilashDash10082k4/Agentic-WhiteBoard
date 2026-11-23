import * as React from "react";

interface AppLogoProps {
  className?: string;
  size?: number;
}

// Geometric SVG logo styled with navy, amber, and cream palette
export function AppLogo({ className = "", size = 32 }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D1C42" />
          <stop offset="100%" stopColor="#22396F" />
        </linearGradient>
      </defs>

      {/* Background shield */}
      <rect width="36" height="36" rx="10" fill="url(#logo-grad-primary)" />

      {/* Connected nodes representing Whiteboard + AI Agents */}
      <circle cx="11" cy="12" r="3.2" fill="#F8E0A4" />
      <circle cx="25" cy="12" r="3.2" fill="#F8E0A4" />
      <circle cx="18" cy="24" r="3.8" fill="#FFFAD3" />

      {/* Connecting vector strokes */}
      <path
        d="M13.5 13.5L16.2 21.2"
        stroke="#F8E0A4"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M22.5 13.5L19.8 21.2"
        stroke="#F8E0A4"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14.5 12H21.5"
        stroke="#FFDBB0"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="1.5 2"
      />

      {/* Center Intelligence Spark */}
      <circle cx="18" cy="17" r="1.5" fill="#FFDBB0" />
    </svg>
  );
}
