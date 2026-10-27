import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';

const DashboardShellContext = createContext(false);

export const DashboardShell = ({ children }) => {
  const isNested = useContext(DashboardShellContext);
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const scrollPositions = useRef({});

  // Sensible scroll restoration between primary categories (Section 8 Requirement)
  useEffect(() => {
    if (prevPathRef.current) {
      scrollPositions.current[prevPathRef.current] = window.scrollY;
    }

    const currentPath = location.pathname;
    const isTopCategory = [
      '/dashboard',
      '/mentees',
      '/academic-records',
      '/academics',
      '/documents',
      '/meetings',
      '/analytics',
      '/users',
      '/mentor-assignments',
      '/settings',
      '/profile',
    ].includes(currentPath);

    if (isTopCategory && prevPathRef.current !== currentPath) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    prevPathRef.current = currentPath;
  }, [location.pathname]);

  // If already rendered inside the persistent application shell, render content directly
  if (isNested) {
    return <>{children || <Outlet />}</>;
  }

  return (
    <DashboardShellContext.Provider value={true}>
      <div className="min-h-screen bg-brand-surface font-sans text-brand-dark antialiased flex flex-col relative overflow-x-hidden">
        {/* Subtle Ambient Brand Glow Behind Glass Navbar (Section 4 Requirement) */}
        <div
          className="pointer-events-none fixed top-0 left-0 right-0 h-64 z-0"
          style={{
            background: `
              radial-gradient(circle at 35% 0%, rgba(201, 44, 46, 0.10), transparent 45%),
              radial-gradient(circle at 70% 0%, rgba(255, 157, 115, 0.12), transparent 45%)
            `,
          }}
          aria-hidden="true"
        />

        {/* Persistent Stationary Glass Capsule Navbar (Section 1B & 12 Requirement) */}
        <TopNavbar />

        {/* Main Workspace Area */}
        <main className="flex-1 pt-24 sm:pt-28 pb-12 px-5 sm:px-7 lg:px-9 max-w-[1600px] mx-auto w-full flex flex-col gap-6 relative z-10">
          {/* Subtle Editorial Page Transition Container (Section 5, 6, 13 Requirements) */}
          <div
            key={location.pathname}
            className="page-transition-enter w-full flex flex-col gap-6 flex-1"
          >
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </DashboardShellContext.Provider>
  );
};
