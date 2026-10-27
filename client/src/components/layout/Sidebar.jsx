import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  BarChart3,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  Layers,
  GraduationCap,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const getNavLinks = () => {
    switch (currentUser.role) {
      case 'MENTOR':
        return [
          { to: '/dashboard', icon: Home, label: 'Mentor Dashboard' },
          { to: '/mentees', icon: Users, label: 'Assigned Mentees' },
          { to: '/academic-records', icon: BookOpen, label: 'Mentee Academic Records' },
          { to: '/documents', icon: FileText, label: 'Document Review Vault' },
          { to: '/meetings', icon: Calendar, label: 'Mentoring Sessions' },
          { to: '/analytics', icon: BarChart3, label: 'Mentee Analytics' },
          { to: '/settings', icon: Settings, label: 'Settings' }
        ];
      case 'HOD':
        return [
          { to: '/dashboard', icon: Home, label: 'HOD Overview' },
          { to: '/mentor-assignments', icon: Layers, label: 'Mentor Assignments' },
          { to: '/mentees', icon: Users, label: 'Department Students' },
          { to: '/analytics', icon: BarChart3, label: 'Department Analytics' },
          { to: '/settings', icon: Settings, label: 'Settings' }
        ];
      case 'ADMIN':
        return [
          { to: '/dashboard', icon: Home, label: 'Admin Console' },
          { to: '/users', icon: Users, label: 'User Governance' },
          { to: '/mentor-assignments', icon: Layers, label: 'Mentor Allocations' },
          { to: '/analytics', icon: BarChart3, label: 'Institutional Metrics' },
          { to: '/settings', icon: Settings, label: 'System Configuration' }
        ];
      case 'MENTEE':
      default:
        return [
          { to: '/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/academic-records', icon: BookOpen, label: 'Academic Records & SGPA' },
          { to: '/documents', icon: FileText, label: 'Documents & Vault' },
          { to: '/meetings', icon: Calendar, label: 'Mentor Sessions' },
          { to: '/profile', icon: GraduationCap, label: 'My 360 Profile' },
          { to: '/settings', icon: Settings, label: 'Settings' }
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="w-18 min-w-[72px] bg-white border-r border-brand-gray-light/60 flex flex-col justify-between items-center py-6 z-20 select-none">
      {/* Top Group */}
      <div className="flex flex-col items-center gap-5 w-full">
        {/* Brand Home Mark */}
        <NavLink
          to="/dashboard"
          className="w-11 h-11 rounded-xl bg-brand-red text-white flex items-center justify-center shadow-[0_4px_14px_rgba(201,44,46,0.35)] hover:scale-105 transition-transform"
          title="MEntee Dashboard"
        >
          <Home className="w-5 h-5 text-white" />
        </NavLink>

        {/* Dynamic Navigation Items */}
        <div className="flex flex-col items-center gap-2 mt-4 w-full px-3">
          {navLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.to}
                className={({ isActive }) =>
                  `w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 relative group ${
                    isActive
                      ? 'bg-brand-red text-white shadow-md'
                      : 'text-brand-dark/70 hover:bg-brand-surface hover:text-brand-dark'
                  }`
                }
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                {/* Floating Tooltip */}
                <span className="absolute left-16 bg-brand-dark text-white text-xs font-medium px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Group */}
      <div className="flex flex-col items-center gap-3 w-full px-3">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-brand-gray hover:bg-brand-red/10 hover:text-brand-red transition-all group relative"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
          <span className="absolute left-16 bg-brand-dark text-white text-xs font-medium px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
            Sign Out
          </span>
        </button>
      </div>
    </nav>
  );
};
