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
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Outer Circle */}
          <circle cx="256" cy="256" r="204" />

          {/* Glass Bowl */}
          <path
            d="M 218 140 
               H 294 
               C 314 188 326 212 326 244 
               C 326 292 294 322 256 322 
               C 218 322 186 292 186 244 
               C 186 212 198 188 218 140 Z"
          />

          {/* Fill Line */}
          <path d="M 187 244 H 325" />

          {/* Compact Curved Base/Pedestal */}
          <path
            d="M 230 320 
               C 230 340 212 344 198 368 
               H 314 
               C 300 344 282 340 282 320"
          />
        </g>
      </svg>
    );
  }

  // Without Circle: Adjusted viewBox to crop and center the shape nicely, with a slightly thicker stroke
  // viewBox spans from X: 110 to 402 (width 292), Y: 106 to 398 (height 292)
  // Centers are: X_mid = 256, Y_mid = 252 (halfway between 140 and 368 plus minor vertical offset)
  // This results in a perfectly centered 292x292 coordinate window.
  // With a viewBox width of 292, strokeWidth={24} corresponds to a 24/292 = 8.2% relative weight,
  // which visually matches the standard Lucide stroke weights of 2/24 = 8.3%.
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
        strokeWidth={24}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Glass Bowl */}
        <path
          d="M 218 140 
             H 294 
             C 314 188 326 212 326 244 
             C 326 292 294 322 256 322 
             C 218 322 186 292 186 244 
             C 186 212 198 188 218 140 Z"
        />

        {/* Fill Line */}
        <path d="M 187 244 H 325" />

        {/* Compact Curved Base/Pedestal */}
        <path
          d="M 230 320 
             C 230 340 212 344 198 368 
             H 314 
             C 300 344 282 340 282 320"
        />
      </g>
    </svg>
  );
}
