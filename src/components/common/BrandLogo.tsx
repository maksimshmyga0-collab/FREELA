import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showDot?: boolean;
  subtitle?: string;
  className?: string;
}

/**
 * Unified Brand Logo for CLARYFE
 * Consistent across Desktop, Mobile, Sidebar, Topbar, Auth, and Modals.
 * Minimalist, dark SaaS aesthetic with high contrast and precision geometry.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showDot = true,
  subtitle,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-10 h-10 rounded-2xl',
  }[size];

  const svgSize = {
    sm: 'w-4 h-4',
    md: 'w-4.5 h-4.5',
    lg: 'w-5.5 h-5.5',
  }[size];

  const textSize = {
    sm: 'text-sm sm:text-base font-extrabold',
    md: 'text-base sm:text-lg font-extrabold',
    lg: 'text-xl sm:text-2xl font-black',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Mark */}
      <div
        className={`${iconDimensions} bg-white text-slate-950 flex items-center justify-center shadow-sm shrink-0 transition-transform duration-200`}
        aria-hidden="true"
      >
        {/* Sleek, geometric C monogram with precision clarity aperture */}
        <svg
          viewBox="0 0 24 24"
          className={`${svgSize} fill-current`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12S6.75 21.5 12 21.5c3.35 0 6.32-1.74 8.03-4.38l-3.32-2.15C15.68 16.51 13.96 17.3 12 17.3c-2.93 0-5.3-2.37-5.3-5.3s2.37-5.3 5.3-5.3c1.96 0 3.68.79 4.71 2.33l3.32-2.15C18.32 4.24 15.35 2.5 12 2.5z" />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span
            className={`${textSize} tracking-tight text-white flex items-center gap-1.5 leading-none`}
          >
            CLARYFE
            {showDot && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] shrink-0"
                aria-hidden="true"
              />
            )}
          </span>
          {subtitle && (
            <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5 leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
