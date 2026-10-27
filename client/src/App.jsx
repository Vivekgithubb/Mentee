import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { DashboardShell } from './components/layout/DashboardShell';
import { StudentDashboard } from './pages/StudentDashboard';
import { MentorDashboard } from './pages/MentorDashboard';
import { HODDashboard } from './pages/HODDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentProfile } from './pages/StudentProfile';
import { MenteesList } from './pages/MenteesList';
import { MeetingsSchedule } from './pages/MeetingsSchedule';
import { Settings } from './pages/Settings';
import { Documents } from './pages/Documents';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { MentorAssignments } from './pages/MentorAssignments';
import { AcademicRecords } from './pages/AcademicRecords';
import { StudentProfile360 } from './pages/StudentProfile360';
import { MentorProfile360 } from './pages/MentorProfile360';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center font-sans text-brand-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold tracking-wider uppercase text-brand-gray">Verifying Session...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const RoleBasedDashboard = () => {
  const { currentUser } = useAuth();

  switch (currentUser?.role) {
    case 'MENTOR':
      return <MentorDashboard />;
    case 'HOD':
      return <HODDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'MENTEE':
    default:
      return <StudentDashboard />;
  }
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Persistent Authenticated App Layout (Stationary Glass Navbar + Page Transition Container) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardShell>
              <Outlet />
            </DashboardShell>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<RoleBasedDashboard />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/academics" element={<AcademicRecords />} />
        <Route path="/academic-records" element={<AcademicRecords />} />
        <Route
          path="/mentor-assignments"
          element={
            <ProtectedRoute allowedRoles={['HOD', 'ADMIN']}>
              <MentorAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentees"
          element={
            <ProtectedRoute allowedRoles={['MENTOR', 'HOD', 'ADMIN']}>
              <MenteesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:id"
          element={
            <ProtectedRoute allowedRoles={['MENTOR', 'HOD', 'ADMIN']}>
              <StudentProfile360 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentors/:id"
          element={
            <ProtectedRoute allowedRoles={['HOD', 'ADMIN']}>
              <MentorProfile360 />
            </ProtectedRoute>
          }
        />
        <Route path="/meetings" element={<MeetingsSchedule />} />
        <Route path="/documents" element={<Documents />} />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['HOD', 'ADMIN']}>
              <HODDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
