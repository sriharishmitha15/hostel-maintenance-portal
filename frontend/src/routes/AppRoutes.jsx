import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { NewComplaint } from '../pages/student/NewComplaint';
import { ComplaintDetail } from '../pages/student/ComplaintDetail';
import { StaffDashboard } from '../pages/staff/StaffDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ManageComplaints } from '../pages/admin/ManageComplaints';
import { ManageStaff } from '../pages/admin/ManageStaff';
import { AnalyticsReports } from '../pages/admin/AnalyticsReports';
import { NotFound } from '../pages/NotFound';

// Home redirector based on authenticated user's role
const HomeRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'staff') return <Navigate to="/staff/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated Layout */}
      <Route element={<AppLayout />}>
        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/new"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <NewComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={['student', 'staff', 'admin']}>
              <ComplaintDetail />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsReports />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
