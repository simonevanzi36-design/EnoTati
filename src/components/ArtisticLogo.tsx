import React from 'react';

interface ArtisticLogoProps {
  className?: string;
}

export function ArtisticLogo({ className = 'w-11 h-11' }: ArtisticLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Soft golden backlight ambient glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8a1c2f]/40 via-[#d4af37]/20 to-transparent blur-sm" />
      
      {/* Artistic SVG Emblem */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]"
      >
        <defs>
          <linearGradient id="goldStem" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fcedb4" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#aa7c11" />
          </linearGradient>
          <linearGradient id="wineFluid" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#540a18" />
            <stop offset="60%" stopColor="#8f1d33" />
            <stop offset="100%" stopColor="#d91b7e" />
          </linearGradient>
        </defs>

        {/* Outer subtle circular artistic border */}
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="url(#goldStem)"
          strokeWidth="1.2"
          strokeDasharray="4 2"
          opacity="0.5"
        />

        {/* Entwined Wine Glass 1 (Left - Simone) */}
        <path
          d="M32 25 C32 46, 47 52, 48 64 L48 78 C42 80, 36 84, 34 88 L58 88"
          stroke="url(#goldStem)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Entwined Wine Glass 2 (Right - Tati) - Mirroring and softly intertwining to form a heart silhouette */}
        <path
          d="M68 25 C68 46, 53 52, 52 64 L52 78 C58 80, 64 84, 66 88 L42 88"
          stroke="url(#goldStem)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Heart-Shaped Wine Swirl bridging the two glasses in harmony */}
        <path
          d="M36 38 C38 31, 45 27, 50 34 C55 27, 62 31, 64 38 C63 47, 50 56, 50 56 C50 56, 37 47, 36 38 Z"
          fill="url(#wineFluid)"
          opacity="0.9"
        />

        {/* Delicate golden sparkle star at the heart center */}
        <path
          d="M50 33 L51.2 36.5 L55 37.5 L51.2 38.5 L50 42 L48.8 38.5 L45 37.5 L48.8 36.5 Z"
          fill="#fff6d6"
        />

        {/* Artistic curved monogram letter E & T subtle ligature flourish at top */}
        <path
          d="M26 25 Q50 16 74 25"
          stroke="url(#goldStem)"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
