import React from 'react';

export const MetricCard = ({
  title,
  mainValue,
  subValue,
  children,
  className = ""
}) => {
  return (
    <article className={`bg-white rounded-3xl p-6 border border-brand-gray-light/60 shadow-editorial flex flex-col justify-between hover:shadow-editorial-hover transition-all duration-200 ${className}`}>
      {title && (
        <div className="mb-2">
          <span className="text-xs font-semibold text-brand-gray tracking-wide uppercase">
            {title}
          </span>
        </div>
      )}

      {(mainValue || subValue) && (
        <div className="flex items-baseline gap-2 mb-4">
          {mainValue && (
            <span className="text-4xl font-bold tracking-tight text-brand-dark leading-none">
              {mainValue}
            </span>
          )}
          {subValue && (
            <span className="text-xs font-medium text-brand-gray">
              {subValue}
            </span>
          )}
        </div>
      )}

      {children}
    </article>
  );
};
