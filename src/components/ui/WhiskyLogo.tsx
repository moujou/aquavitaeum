import React from 'react';

interface WhiskyLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  hasCircle?: boolean;
}

export function WhiskyLogo({ size = 24, className, hasCircle = false, ...props }: WhiskyLogoProps) {
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
  // viewBox spans from X: 110 to 402 (width 292), Y: 106 to 398 (height 292)
  // Centers are: X_mid = 256, Y_mid = 252 (halfway between 140 and 368 plus minor vertical offset)
  // This results in a perfectly centered 292x292 coordinate window.
  // With a viewBox width of 292, strokeWidth={12} corresponds to a 12/292 = 4.1% relative weight,
  // which visually matches the standard Lucide stroke weights.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="110 106 292 292"
      width={size}
      height={size}
      className={className}
      {...props}
    >
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
