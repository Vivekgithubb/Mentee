import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  FileText,
  Award,
  GitBranch,
  Briefcase,
  Search,
  Bell,
  ChevronDown,
  Check,
  Menu,
  X,
  User,
  Shield,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";

export const TopNavbar = () => {
  const { currentUser, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Dropdown states
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDevDropdown, setShowDevDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [mentorMentees, setMentorMentees] = useState([]);

  // Notifications state (real backend data)
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Refs for click outside handling
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const devDropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sliding Active Glass Pill measurement
  const navContainerRef = useRef(null);
  const linkRefs = useRef({});
  const [activePill, setActivePill] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [isReady, setIsReady] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
      if (
        devDropdownRef.current &&
        !devDropdownRef.current.contains(e.target)
      ) {
        setShowDevDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowProfileMenu(false);
        setShowNotifications(false);
        setShowDevDropdown(false);
        setShowMobileMenu(false);
        setShowSearchModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowProfileMenu(false);
    setShowNotifications(false);
    setShowDevDropdown(false);
    setShowMobileMenu(false);
    setShowSearchModal(false);
    setSearchQuery("");
  }, [location.pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (showSearchModal && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [showSearchModal]);

  // Fetch real notifications
  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      setLoadingNotifications(true);
      const res = await api.notifications.getAll();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Could not fetch notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // For mentors: fetch assigned mentees for quick search
  useEffect(() => {
    if (currentUser?.role === "MENTOR") {
      const loadMentees = async () => {
        try {
          const res = await api.mentor.getMentees();
          if (res.success) {
            setMentorMentees(res.mentees || res.students || []);
          }
        } catch (err) {
          console.warn("Could not load mentees for search:", err);
        }
      };
      loadMentees();
    }
  }, [currentUser?.role]);

  // Handle Mark Single Notification Read
  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.notifications.markRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Handle Mark All Notifications Read
  const handleMarkAllRead = async () => {
    try {
      const res = await api.notifications.markAllRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        addToast("All notifications marked as read.");
      }
    } catch (err) {
      addToast("Failed to mark all as read.", "error");
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    addToast("Signed out successfully.");
    navigate("/login");
  };

  // Primary Role Navigation Items
  const getNavItems = () => {
    switch (currentUser?.role) {
      case "MENTOR":
        return [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/mentees", label: "My Mentees" },
          { to: "/academic-records", label: "Records" },
          { to: "/documents", label: "Documents" },
          { to: "/meetings", label: "Meetings" },
        ];
      case "HOD":
        return [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/mentees", label: "Students" },
          { to: "/mentor-assignments", label: "Mentors" },
          { to: "/analytics", label: "Analytics" },
          { to: "/meetings", label: "Meetings" },
        ];
      case "ADMIN":
        return [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/users", label: "Users" },
          { to: "/mentor-assignments", label: "Assignments" },
          { to: "/documents", label: "Documents" },
          { to: "/analytics", label: "Analytics" },
        ];
      case "MENTEE":
      default:
        return [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/academic-records", label: "Academics" },
          { to: "/documents", label: "Documents" },
          { to: "/meetings", label: "Meetings" },
        ];
    }
  };

  const navItems = getNavItems();

  // Helper to match active nav item including nested routes and detail pages (Section 16 & 17)
  const resolveActiveNavKey = (pathname, role, items) => {
    if (pathname === "/dashboard") return "/dashboard";

    // Nested detail page route mappings
    if (pathname.startsWith("/students")) {
      const hasMentees = items.some((i) => i.to === "/mentees");
      if (hasMentees) return "/mentees";
    }

    if (pathname.startsWith("/mentors")) {
      const hasAssignments = items.some((i) => i.to === "/mentor-assignments");
      if (hasAssignments) return "/mentor-assignments";
    }

    if (pathname.startsWith("/academics")) {
      const hasRecords = items.some((i) => i.to === "/academic-records");
      if (hasRecords) return "/academic-records";
    }

    if (role === "MENTEE" && pathname.startsWith("/profile")) {
      return "development";
    }

    // Exact or prefix match with primary nav items
    for (const item of items) {
      if (item.to !== "/dashboard" && pathname.startsWith(item.to)) {
        return item.to;
      }
    }

    return "/dashboard";
  };

  // Dynamically calculate sliding active capsule position based on current route
  const updateActivePill = () => {
    const activeKey = resolveActiveNavKey(
      location.pathname,
      currentUser?.role,
      navItems
    );
    const targetEl = activeKey ? linkRefs.current[activeKey] : null;

    if (targetEl && navContainerRef.current) {
      setActivePill({
        left: targetEl.offsetLeft,
        width: targetEl.offsetWidth,
        opacity: 1,
      });
    } else {
      setActivePill((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  // Initial measurement on mount without animation to prevent initial jump (Section 4 Requirement)
  useLayoutEffect(() => {
    updateActivePill();
    const frame = requestAnimationFrame(() => {
      setIsReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Subsequent route updates with smooth sliding transition (Section 2 & 3)
  useEffect(() => {
    if (isReady) {
      updateActivePill();
    }
  }, [location.pathname, navItems, currentUser?.role, isReady]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => updateActivePill();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navItems, currentUser?.role]);

  // Search Results filtering
  const getFilteredSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    if (currentUser?.role === "MENTEE") {
      const items = [
        {
          title: "Academic Records & SGPA",
          path: "/academic-records",
          category: "Academics",
        },
        {
          title: "Official Documents & Vault",
          path: "/documents",
          category: "Documents",
        },
        {
          title: "Mentoring Sessions & Meetings",
          path: "/meetings",
          category: "Meetings",
        },
        { title: "My 360° Profile", path: "/profile", category: "Profile" },
        {
          title: "Projects Portfolio",
          path: "/profile?tab=projects",
          category: "Development",
        },
        {
          title: "Certifications",
          path: "/profile?tab=certifications",
          category: "Development",
        },
        {
          title: "Internships",
          path: "/profile?tab=internships",
          category: "Development",
        },
        { title: "Account Settings", path: "/settings", category: "Account" },
      ];
      return items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    if (currentUser?.role === "MENTOR") {
      const menteeResults = mentorMentees
        .filter((m) => {
          const name = m.user?.name || "";
          const usn = m.studentId || "";
          const dept = m.department || "";
          return (
            name.toLowerCase().includes(q) ||
            usn.toLowerCase().includes(q) ||
            dept.toLowerCase().includes(q)
          );
        })
        .map((m) => ({
          title: `${m.user?.name || "Mentee"} (${m.studentId})`,
          path: `/students/${m._id}`,
          category: `Mentee • Sem ${m.semester || 1}`,
          action: "360° Profile",
        }));

      const pageShortcuts = [
        {
          title: "Review Submitted Documents",
          path: "/documents",
          category: "Vault",
        },
        {
          title: "Update Semester Marks & SGPA",
          path: "/academic-records",
          category: "Academics",
        },
        {
          title: "Mentoring Sessions Schedule",
          path: "/meetings",
          category: "Meetings",
        },
        {
          title: "Assigned Mentees Roster",
          path: "/mentees",
          category: "Mentees",
        },
      ].filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );

      return [...menteeResults, ...pageShortcuts];
    }

    if (currentUser?.role === "HOD") {
      const items = [
        {
          title: "Department Students Roster",
          path: "/mentees",
          category: "Students",
        },
        {
          title: "Mentor Allocations & Workload",
          path: "/mentor-assignments",
          category: "Faculty",
        },
        {
          title: "Department Analytics & CGPA",
          path: "/analytics",
          category: "Analytics",
        },
        {
          title: "Department Mentoring Sessions",
          path: "/meetings",
          category: "Meetings",
        },
      ];
      return items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    if (currentUser?.role === "ADMIN") {
      const items = [
        {
          title: "User Governance & Creation",
          path: "/users",
          category: "Admin",
        },
        {
          title: "Institutional Allocations",
          path: "/mentor-assignments",
          category: "Admin",
        },
        {
          title: "Institutional Document Vault",
          path: "/documents",
          category: "Admin",
        },
        {
          title: "System Analytics & Metrics",
          path: "/analytics",
          category: "Analytics",
        },
        {
          title: "System Settings & Config",
          path: "/settings",
          category: "Settings",
        },
      ];
      return items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    return [];
  };

  const searchResults = getFilteredSearchResults();

  return (
    <>
      {/* ================= FIXED FLOATING LIQUID GLASS CAPSULE NAVBAR ================= */}
      <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none select-none">
        {/* THE FLOATING LIQUID GLASS CAPSULE */}
        <nav
          className="glass-navbar pointer-events-auto relative w-fit max-w-[96%] sm:max-w-fit flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 px-3 sm:px-4 py-1.5 text-xs text-brand-dark"
          aria-label="Primary Application Navigation"
        >
          {/* ========== LEFT: COMPACT BRAND LOGO TILE ========== */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 group focus:outline-none rounded-full pr-1 shrink-0"
            title="MEntee Dashboard"
          >
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-[11px] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform duration-150"
              style={{
                background: "#C92C2E",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 16px rgba(201,44,46,0.28)",
              }}
            >
              <GraduationCap className="w-4 h-4 text-white drop-shadow-sm" />
            </div>
            <span className="font-bold text-sm tracking-tight text-brand-dark group-hover:text-brand-red transition-colors hidden xs:inline-block">
              Mentee
            </span>
          </NavLink>

          {/* ========== CENTER: SEGMENTED NAVIGATION WITH SLIDING GLASS ACTIVE CAPSULE ========== */}
          <div
            ref={navContainerRef}
            className="relative hidden lg:flex items-center gap-0.5 p-0.5"
          >
            {/* The Dynamic Sliding Glass Active Pill (Section 2, 3, 4 Requirements) */}
            <div
              className="glass-sliding-pill absolute inset-y-0.5 pointer-events-none z-0"
              style={{
                transform: `translateX(${activePill.left}px)`,
                width: `${activePill.width}px`,
                opacity: activePill.opacity,
                transition: isReady
                  ? "transform 420ms cubic-bezier(0.34, 1.2, 0.5, 1), width 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease"
                  : "none",
              }}
              aria-hidden="true"
            />

            {navItems.map((item) => {
              const currentActiveKey = resolveActiveNavKey(
                location.pathname,
                currentUser?.role,
                navItems
              );
              const isItemActive = currentActiveKey === item.to;
              return (
                <NavLink
                  key={item.to}
                  ref={(el) => {
                    if (el) linkRefs.current[item.to] = el;
                  }}
                  to={item.to}
                  className={`relative z-10 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-tight transition-colors duration-200 ${
                    isItemActive
                      ? "text-brand-dark font-bold"
                      : "text-zinc-600 hover:text-brand-dark"
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}

            {/* MENTEE DEVELOPMENT DROPDOWN */}
            {currentUser?.role === "MENTEE" && (
              <div className="relative z-10" ref={devDropdownRef}>
                <button
                  ref={(el) => {
                    if (el) linkRefs.current["development"] = el;
                  }}
                  type="button"
                  onClick={() => setShowDevDropdown(!showDevDropdown)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-tight transition-colors duration-200 flex items-center gap-1 ${
                    showDevDropdown ||
                    resolveActiveNavKey(
                      location.pathname,
                      currentUser?.role,
                      navItems
                    ) === "development"
                      ? "text-brand-dark font-bold"
                      : "text-zinc-600 hover:text-brand-dark"
                  }`}
                  aria-expanded={showDevDropdown}
                >
                  <span>Development</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      showDevDropdown
                        ? "rotate-180 text-brand-dark"
                        : "text-zinc-500"
                    }`}
                  />
                </button>

                {showDevDropdown && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 rounded-2xl glass-popover p-1.5 z-50 text-xs space-y-0.5 animate-fadeIn">
                    <NavLink
                      to="/profile"
                      className="flex items-center gap-2 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 font-medium transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>My 360° Profile</span>
                    </NavLink>
                    <NavLink
                      to="/profile?tab=projects"
                      className="flex items-center gap-2 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 font-medium transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-rose-400" />
                      <span>Projects</span>
                    </NavLink>
                    <NavLink
                      to="/profile?tab=certifications"
                      className="flex items-center gap-2 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 font-medium transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Certifications</span>
                    </NavLink>
                    <NavLink
                      to="/profile?tab=internships"
                      className="flex items-center gap-2 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 font-medium transition-colors"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Internships</span>
                    </NavLink>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========== RIGHT: ACTIONS & WHITE CTA PROFILE CAPSULE ========== */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Trigger Button */}
            <div className="relative" ref={searchRef}>
              <button
                type="button"
                onClick={() => setShowSearchModal(!showSearchModal)}
                className="w-8 h-8 rounded-full text-zinc-600 hover:text-brand-dark hover:bg-black/5 flex items-center justify-center transition-colors focus:outline-none"
                title="Search records"
                aria-label="Search records"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              {/* Compact Search Overlay Popover */}
              {showSearchModal && (
                <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-72 sm:w-80 rounded-2xl glass-popover p-3 z-50 text-xs animate-fadeIn">
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10 focus-within:border-white/30 transition-all">
                    <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder={
                        currentUser?.role === "MENTOR"
                          ? "Search mentees, USN, records..."
                          : currentUser?.role === "HOD"
                          ? "Search students, faculty, stats..."
                          : currentUser?.role === "ADMIN"
                          ? "Search users, allocations, logs..."
                          : "Search academics, docs, vault..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs text-white outline-none w-full placeholder:text-zinc-400 font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-zinc-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {searchQuery.trim().length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 max-h-56 overflow-y-auto space-y-1">
                      {searchResults.length === 0 ? (
                        <p className="text-center py-3 text-zinc-400 text-xs">
                          No matching records found.
                        </p>
                      ) : (
                        searchResults.map((res, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setShowSearchModal(false);
                              navigate(res.path);
                            }}
                            className="p-2 rounded-xl hover:bg-white/10 cursor-pointer flex items-center justify-between transition-colors group"
                          >
                            <div>
                              <span className="font-bold text-white block group-hover:text-rose-300 transition-colors">
                                {res.title}
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                {res.category}
                              </span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications Bell Trigger */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 rounded-full text-zinc-600 hover:text-brand-dark hover:bg-black/5 flex items-center justify-center relative transition-colors focus:outline-none"
                title="Notifications"
                aria-label={`Notifications, ${unreadCount} unread`}
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white"
                    style={{ background: "#C92C2E" }}
                  />
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-80 sm:w-96 rounded-2xl glass-popover p-3.5 z-50 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-rose-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {loadingNotifications ? (
                    <p className="text-center py-4 text-zinc-400">
                      Loading notifications...
                    </p>
                  ) : notifications.length === 0 ? (
                    <div className="p-5 text-center text-zinc-400 space-y-1">
                      <Bell className="w-5 h-5 mx-auto text-zinc-500" />
                      <p className="font-semibold text-white text-xs">
                        All caught up!
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        No active notifications.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            if (!n.read)
                              handleMarkAsRead(n._id, {
                                stopPropagation: () => {},
                              });
                            if (n.link) navigate(n.link);
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                            !n.read
                              ? "bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50"
                              : "bg-white/5 border-white/5 hover:border-white/15"
                          }`}
                        >
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center gap-1.5">
                              {!n.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                              )}
                              <h5 className="font-bold text-xs text-white leading-snug">
                                {n.title}
                              </h5>
                            </div>
                            <p className="text-[11px] text-zinc-300">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-zinc-500 block pt-0.5">
                              {n.createdAt
                                ? new Date(n.createdAt).toLocaleDateString()
                                : "Recent"}
                            </span>
                          </div>

                          {!n.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(n._id, e)}
                              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                              title="Mark read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* WHITE CAPSULE CTA BUTTON (Matches the Supaste / CodeFronts Profile Capsule) */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="bg-white hover:bg-zinc-50 text-brand-dark border border-zinc-200/90 px-2.5 sm:px-3 py-1 rounded-full font-bold text-xs shadow-sm transition-all duration-150 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                title="Account Menu"
                aria-expanded={showProfileMenu}
              >
                <img
                  src={
                    currentUser?.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      currentUser?.name || "User"
                    )}`
                  }
                  alt={currentUser?.name || "User"}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-black/10 shrink-0"
                />
                <span className="max-w-[70px] sm:max-w-[100px] truncate leading-none">
                  {currentUser?.name?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-zinc-500 transition-transform duration-150 ${
                    showProfileMenu ? "rotate-180 text-brand-dark" : ""
                  }`}
                />
              </button>

              {/* Profile / Account Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl glass-popover p-3 z-50 text-xs animate-fadeIn">
                  <div className="pb-2.5 border-b border-white/10">
                    <p className="font-bold text-sm text-white truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {currentUser?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white uppercase tracking-wider">
                        {currentUser?.role}
                      </span>
                      {currentUser?.department && (
                        <span className="text-[10px] text-zinc-400 truncate">
                          {currentUser.department}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 space-y-0.5">
                    {currentUser?.role === "MENTEE" && (
                      <NavLink
                        to="/profile"
                        className="w-full text-left p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 font-medium transition-colors flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>My 360° Profile</span>
                      </NavLink>
                    )}

                    <NavLink
                      to="/settings"
                      className="w-full text-left p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 font-medium transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Account Settings</span>
                    </NavLink>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left p-2 rounded-xl text-rose-400 hover:bg-rose-500/15 font-bold transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle (Hamburger) */}
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden w-7 h-7 rounded-full text-zinc-600 hover:text-brand-dark hover:bg-black/5 flex items-center justify-center transition-colors focus:outline-none"
              title="Toggle Menu"
              aria-label="Toggle Navigation Menu"
            >
              {showMobileMenu ? (
                <X className="w-4 h-4 text-brand-dark" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* ========== MOBILE FLOATING MENU DRAWER ========== */}
      {showMobileMenu && (
        <div className="fixed top-16 left-4 right-4 z-50 rounded-2xl glass-popover p-4 text-xs space-y-3 lg:hidden animate-fadeIn max-w-md mx-auto">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 block">
              Navigation
            </span>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl font-bold transition-colors ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {currentUser?.role === "MENTEE" && (
            <div className="pt-2 border-t border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 block">
                Development Portfolio
              </span>
              <NavLink
                to="/profile?tab=projects"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 font-medium"
              >
                <GitBranch className="w-3.5 h-3.5 text-rose-400" />
                <span>Projects</span>
              </NavLink>
              <NavLink
                to="/profile?tab=certifications"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 font-medium"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Certifications</span>
              </NavLink>
              <NavLink
                to="/profile?tab=internships"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 font-medium"
              >
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                <span>Internships</span>
              </NavLink>
            </div>
          )}

          <div className="pt-2 border-t border-white/10 space-y-1">
            <NavLink
              to="/settings"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 font-medium"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              <span>Settings</span>
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
