import React from 'react';

interface AromaIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number | string;
}

/**
 * Steaming Aroma Bowl Icon (Lucide 24x24 vector standard).
 * Represents rising scent & flavor notes with three wavy aroma lines above a tasting bowl.
 */
export function AromaIcon({
  size = 24,
  strokeWidth = 2,
  className,
  ...props
}: AromaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Three rising wavy aroma / steam lines */}
      <path d="M12 2c-.8 1.2-.8 2.4 0 3.6.8 1.2.8 2.4 0 3.6" />
      <path d="M7.5 3c-.7 1-.7 2.1 0 3.1.7 1 .7 2.1 0 3.1" />
      <path d="M16.5 3c-.7 1-.7 2.1 0 3.1.7 1 .7 2.1 0 3.1" />
      {/* Tasting bowl & base */}
      <path d="M4 12h16a1 1 0 0 1 1 1 9 9 0 0 1-18 0 1 1 0 0 1 1-1Z" />
      <path d="M8 21h8" />
    </svg>
  );
}
export default AromaIcon;
