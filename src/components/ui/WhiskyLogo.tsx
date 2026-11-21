import React from 'react';

interface WhiskyLogoProps extends Omit<React.SVGProps<SVGSVGElement>, 'title'> {
  size?: number | string;
  hasCircle?: boolean;
  title?: string;
  /** Optional hex color to fill the liquid inside the Glencairn glass bowl */
  liquidColor?: string;
}

export function WhiskyLogo({
  size = 24,
  className,
  hasCircle = false,
  title,
  liquidColor,
  ...props
}: WhiskyLogoProps) {
  const liquidPaths = liquidColor ? (
    <path
      d="M 186 246 
         C 210 262, 240 262, 268 252 
         C 296 242, 316 236, 326 244 
         C 326 292, 294 322, 256 322 
         C 218 322, 186 292, 186 246 Z"
      fill={liquidColor}
      fillOpacity={0.96}
      stroke="none"
    />
  ) : null;

  if (hasCircle) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className={className}
        {...props}
      >
        {title && <title>{title}</title>}
        {liquidPaths}
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Outer Circle */}
          <circle cx="256" cy="256" r="204" />

          {/* Glass Bowl */}
          <path
            d="M 220 140 
               H 292 
               C 299 175, 326 215, 326 244 
               C 326 292, 294 322, 256 322 
               C 218 322, 186 292, 186 244 
               C 186 215, 213 175, 220 140 Z"
          />

          {/* Dynamic Highland Swirl Meniscus Wave */}
          <path
            strokeWidth={7}
            d="M 186 246 
               C 210 262, 240 262, 268 252 
               C 296 242, 316 236, 326 244"
          />

          {/* Compact Curved Base/Pedestal */}
          <path
            fill="currentColor"
            d="M 230 320 
               C 230 340 212 344 198 368 
               H 314 
               C 300 344 282 340 282 320 
               C 270 322, 242 322, 230 320 Z"
          />
        </g>
      </svg>
    );
  }

  // Without Circle: Adjusted viewBox to crop and center the shape nicely, with a slightly thicker stroke
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="110 106 292 292"
      width={size}
      height={size}
      shapeRendering="geometricPrecision"
      className={className}
      {...props}
    >
      {title && <title>{title}</title>}
      {liquidPaths}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Glass Bowl */}
        <path
          d="M 220 140 
             H 292 
             C 299 175, 326 215, 326 244 
             C 326 292, 294 322, 256 322 
             C 218 322, 186 292, 186 244 
             C 186 215, 213 175, 220 140 Z"
        />

        {/* Dynamic Highland Swirl Meniscus Wave */}
        <path
          strokeWidth={10}
          d="M 186 246 
             C 210 262, 240 262, 268 252 
             C 296 242, 316 236, 326 244"
        />

        {/* Compact Curved Base/Pedestal */}
        <path
          fill="currentColor"
          d="M 230 320 
             C 230 340 212 344 198 368 
             H 314 
             C 300 344 282 340 282 320 
             C 270 322, 242 322, 230 320 Z"
        />
      </g>
    </svg>
  );
}

/**
 * Purpose-drawn half-Glencairn edge silhouette for the right card border.
 * Drawn natively in a tight 0..48 × 0..112 coordinate space where x=48 is the exact
 * vertical right-edge cut axis — zero empty viewBox padding, no CSS scale/translate distortion,
 * and crisp native vector stroke weights.
 */
export function GlencairnEdgeColourBadge({
  liquidColor,
  title,
  className,
}: {
  liquidColor: string;
  title?: string;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 112"
      shapeRendering="geometricPrecision"
      className={className}
      aria-label={title}
    >
      {title && <title>{title}</title>}

      {/* 1. Pure Whisky Liquid Fill (Natural curved meniscus top without top stroke border) */}
      <path
        d="M 5.5 54.5
           C 17 61.5, 32 61.5, 48 56.5
           L 48 84
           C 23 84, 5.5 72, 5.5 54.5 Z"
        fill={liquidColor}
        stroke="none"
      />

      {/* 2. Native Fine-Line Glencairn Crystal Contour & Solid Base (Flush at x=48) */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Rim & Left Tulip Bowl Contour */}
        <path
          d="M 48 6
             H 21
             C 17.5 23, 5 41, 5 54.5
             C 5 72.5, 23 84, 48 84"
        />

        {/* Solid Uniform Glencairn Base / Pedestal */}
        <path
          fill="currentColor"
          stroke="none"
          d="M 30 82.5
             C 30 92.5, 20.5 94.5, 13 107.5
             H 48
             V 82.5
             Z"
        />
      </g>
    </svg>
  );
}
