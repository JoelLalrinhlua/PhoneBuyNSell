import React from 'react';
import type { BrandId } from '../types/buyback';

interface BrandLogoProps {
  brandId: BrandId;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ brandId, className = 'h-8' }) => {
  switch (brandId) {
    case 'apple':
      return (
        <svg viewBox="0 0 140 44" className={className} role="img" aria-label="Apple">
          <path
            d="M27.4 22.8c0-3.7 3-5.5 3.2-5.6-1.7-2.5-4.4-2.9-5.4-3-2.3-.2-4.5 1.3-5.6 1.3-1.2 0-3-1.3-4.9-1.3-2.5 0-4.9 1.5-6.2 3.7-2.6 4.6-.7 11.4 1.9 15.1 1.3 1.8 2.8 3.9 4.8 3.8 1.9-.1 2.6-1.2 4.9-1.2 2.3 0 3 1.2 4.9 1.2 2 0 3.3-1.8 4.6-3.7 1.5-2.1 2.1-4.1 2.1-4.2-.1-.1-4.3-1.7-4.3-6.1zm-3.8-11.1c1-1.3 1.7-3 1.5-4.7-1.5.1-3.3 1-4.4 2.2-.9 1.1-1.8 2.9-1.6 4.6 1.7.1 3.4-.8 4.5-2.1z"
            fill="#0A0A0C"
          />
          <text
            x="44"
            y="29"
            fill="#0A0A0C"
            fontFamily="Plus Jakarta Sans, Inter, sans-serif"
            fontWeight="700"
            fontSize="24"
            letterSpacing="-0.03em"
          >
            Apple
          </text>
        </svg>
      );

    case 'google':
      return (
        <svg viewBox="0 0 56 56" className={className} role="img" aria-label="Google">
          <path
            fill="#4285F4"
            d="M51.6 28.6c0-1.7-.2-3.4-.5-5H28v9.5h13.2c-.6 3.1-2.3 5.7-4.9 7.4v6.2h8c4.6-4.3 7.3-10.6 7.3-18.1z"
          />
          <path
            fill="#34A853"
            d="M28 52.6c6.6 0 12.2-2.2 16.3-6l-8-6.2c-2.2 1.5-5 2.4-8.3 2.4-6.4 0-11.8-4.3-13.7-10.1H6.1v6.4C10.2 47.1 18.5 52.6 28 52.6z"
          />
          <path
            fill="#FBBC05"
            d="M14.3 32.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7v-6.4H6.1C4.4 20.3 3.4 24 3.4 28s1 7.7 2.7 11.1l8.2-6.4z"
          />
          <path
            fill="#EA4335"
            d="M28 13.2c3.6 0 6.8 1.2 9.4 3.7l7-7C40.2 5.9 34.6 3.4 28 3.4 18.5 3.4 10.2 8.9 6.1 16.9l8.2 6.4c1.9-5.8 7.3-10.1 13.7-10.1z"
          />
        </svg>
      );

    case 'iqoo':
      return (
        <svg viewBox="0 0 140 44" className={className} role="img" aria-label="iQOO">
          <rect x="16" y="13" width="4.2" height="19" rx="1.5" fill="#EAB308" />
          <circle cx="18.1" cy="8.5" r="2.3" fill="#EAB308" />
          <circle cx="40" cy="22.5" r="9.5" fill="none" stroke="#EAB308" strokeWidth="4" />
          <path d="M43 25.5L49.5 32" stroke="#EAB308" strokeWidth="4" strokeLinecap="round" />
          <circle cx="69" cy="22.5" r="9.5" fill="none" stroke="#EAB308" strokeWidth="4" />
          <circle cx="98" cy="22.5" r="9.5" fill="none" stroke="#EAB308" strokeWidth="4" />
        </svg>
      );

    case 'motorola':
      return (
        <svg viewBox="0 0 170 44" className={className} role="img" aria-label="Motorola">
          <circle cx="20" cy="22" r="12" fill="#E11D2E" />
          <path
            d="M20 13.2l-3.7 12.2-2.7-7.8-3.8 10.8h2.2l1.8-5.1 2.7 7.1 3.5-9.8 3.5 9.8 2.7-7.1 1.8 5.1h2.2l-3.8-10.8-2.7 7.8-3.7-12.2z"
            fill="#FFFFFF"
          />
          <text
            x="38"
            y="27.5"
            fill="#0A0A0C"
            fontFamily="Plus Jakarta Sans, Inter, sans-serif"
            fontWeight="600"
            fontSize="21"
            letterSpacing="-0.02em"
          >
            motorola
          </text>
        </svg>
      );

    case 'nothing':
      return (
        <svg viewBox="0 0 176 44" className={className} role="img" aria-label="Nothing">
          <text
            x="88"
            y="28"
            textAnchor="middle"
            fill="#0A0A0C"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="700"
            fontSize="21"
            letterSpacing="0.18em"
          >
            NOTHING
          </text>
          <circle cx="164" cy="14" r="2.2" fill="#DC2626" />
        </svg>
      );

    case 'oneplus':
      return (
        <svg viewBox="0 0 176 44" className={className} role="img" aria-label="OnePlus">
          <path d="M12 13h15v4h-2.5v-1.5H14.5v15h15V20.5H32v12.5H12V13z" fill="#EB0029" />
          <path d="M21 18.5h2.4v9.5H21v-7.2h-2v-1.8c1.1 0 1.8-.2 2-.5z" fill="#EB0029" />
          <path d="M29.5 10.5h2.3v3.2H35V16h-3.2v3.2h-2.3V16h-3.2v-2.3h3.2v-3.2z" fill="#EB0029" />
          <text
            x="42"
            y="28"
            fill="#EB0029"
            fontFamily="Plus Jakarta Sans, Inter, sans-serif"
            fontWeight="700"
            fontSize="19"
            letterSpacing="0.06em"
          >
            ONEPLUS
          </text>
        </svg>
      );

    case 'oppo':
      return (
        <svg viewBox="0 0 148 44" className={className} role="img" aria-label="OPPO">
          <text
            x="74"
            y="28"
            textAnchor="middle"
            fill="#046A38"
            fontFamily="Plus Jakarta Sans, Inter, sans-serif"
            fontWeight="600"
            fontSize="28"
            letterSpacing="0.03em"
          >
            oppo
          </text>
        </svg>
      );

    case 'poco':
      return (
        <svg viewBox="0 0 148 44" className={className} role="img" aria-label="POCO">
          <text
            x="74"
            y="29"
            textAnchor="middle"
            fill="#EAB308"
            fontFamily="Plus Jakarta Sans, Inter, sans-serif"
            fontWeight="800"
            fontSize="27"
            letterSpacing="0.05em"
          >
            POCO
          </text>
        </svg>
      );

    case 'realme':
      return (
        <svg viewBox="0 0 150 44" className={className} role="img" aria-label="realme">
          <rect x="13" y="8" width="124" height="28" rx="4" fill="#FFC915" />
          <text
            x="75"
            y="28"
            textAnchor="middle"
            fill="#18181B"
            fontFamily="Plus Jakarta Sans, Inter, sans-serif"
            fontWeight="700"
            fontSize="20"
            letterSpacing="-0.01em"
          >
            realme
          </text>
        </svg>
      );

    case 'samsung':
      return (
        <svg viewBox="0 0 166 44" className={className} role="img" aria-label="Samsung">
          <text
            x="83"
            y="28.5"
            textAnchor="middle"
            fill="#1428A0"
            fontFamily="Plus Jakarta Sans, Inter, sans-serif"
            fontWeight="800"
            fontSize="22"
            letterSpacing="0.08em"
          >
            SAMSUNG
          </text>
        </svg>
      );

    case 'vivo':
      return (
        <svg viewBox="0 0 140 44" className={className} role="img" aria-label="vivo">
          <text
            x="70"
            y="29"
            textAnchor="middle"
            fill="#415FFF"
            fontFamily="Plus Jakarta Sans, Inter, sans-serif"
            fontWeight="600"
            fontSize="29"
            letterSpacing="0.02em"
          >
            vivo
          </text>
        </svg>
      );

    case 'xiaomi':
      return (
        <svg viewBox="0 0 64 52" className={className} role="img" aria-label="Xiaomi">
          <rect x="8" y="4" width="48" height="44" rx="13" fill="#FF6900" />
          <path
            d="M19 36V17h11.5c4.2 0 6.5 2.3 6.5 6.4V36h-4.4V23.8c0-1.8-.9-2.7-2.7-2.7h-6.5V36H19zm7.6 0V25.2H31V36h-4.4zm14.2 0V17h4.4v19h-4.4z"
            fill="#FFFFFF"
          />
        </svg>
      );
  }
};
