import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const FeatureCard = ({
  title = "A new request has been received.",
  subtitle = "Please process it as soon as possible.",
  actionText = "Open request",
  onAction,
  className = ""
}) => {
  return (
    <article className={`relative overflow-hidden bg-brand-red text-white rounded-3xl p-7 flex flex-col justify-between shadow-xl min-h-[380px] ${className}`}>
      {/* Text block */}
      <div className="relative z-10">
        <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
          {title}
        </h2>
        <p className="text-white/85 text-sm mt-3 leading-relaxed font-normal">
          {subtitle}
        </p>
      </div>

      {/* Signature Peach Starburst Graphic */}
      <div className="absolute -bottom-12 -right-12 w-56 h-56 pointer-events-none z-0">
        <svg
          className="w-full h-full animate-spin-slow origin-center opacity-95"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 0 L124 64 L190 40 L154 100 L200 148 L134 148 L124 200 L100 148 L66 200 L56 148 L0 148 L46 100 L10 40 L76 64 Z"
            fill="#FF9D73"
          />
        </svg>
      </div>

      {/* Action CTA Button */}
      <div className="relative z-10 mt-auto pt-6">
        <button
          onClick={onAction}
          className="w-full bg-white text-brand-dark px-5 py-3.5 rounded-full font-semibold text-sm flex items-center justify-between hover:bg-neutral-100 transition-all duration-200 shadow-md group active:scale-[0.98]"
        >
          <span>{actionText}</span>
          <div className="w-7 h-7 rounded-full bg-brand-dark/5 flex items-center justify-center group-hover:bg-brand-dark/10 transition-colors">
            <ArrowUpRight className="w-4 h-4 text-brand-dark transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </button>
      </div>
    </article>
  );
};
