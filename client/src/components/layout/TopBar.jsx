import React from "react";
import { Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const TopBar = ({
  title = "Dashboard",
  subtitle,
  badge,
  onSearch,
  searchPlaceholder = "Filter page records...",
  action,
  children,
}) => {
  const { currentUser } = useAuth();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-gray-light/40">
      {/* Editorial Page Heading */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-dark">
            {title}
          </h1>
          {badge
            ? badge
            : currentUser && (
                <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-brand-gray px-2.5 py-0.5 rounded-full bg-brand-gray-light/60">
                  {currentUser.role}
                </span>
              )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-brand-gray font-medium max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {/* Contextual Page Actions & In-Page Search */}
      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0 flex-wrap">
        {onSearch && (
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-brand-gray-light/80 focus-within:border-brand-dark focus-within:ring-2 focus-within:ring-brand-dark/10 w-48 sm:w-64 transition-all shadow-sm">
            <Search className="w-3.5 h-3.5 text-brand-gray shrink-0" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
              className="bg-transparent text-xs font-semibold text-brand-dark outline-none w-full placeholder:text-brand-gray"
            />
          </div>
        )}

        {action}
        {children}
      </div>
    </header>
  );
};
