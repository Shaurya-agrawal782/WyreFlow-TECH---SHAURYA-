import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleGuard } from './context/RoleGuard';

// Layout Component
import MainLayout from './components/layout/MainLayout';

// Page Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import CandidateList from './pages/candidates/CandidateList';
import CandidateCreate from './pages/candidates/CandidateCreate';
import CandidateDetail from './pages/candidates/CandidateDetail';
import CSVImport from './pages/import/CSVImport';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Sign-In and Sign-Up Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Area wrapping Main Workspace Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Common Authorized Dashboard & Reading views */}
            <Route index element={<Dashboard />} />
            <Route path="candidates" element={<CandidateList />} />
            <Route path="candidates/:id" element={<CandidateDetail />} />

            {/* Candidate Writing (Recruiter & Admin) */}
            <Route
              path="candidates/new"
              element={
                <RoleGuard allowedRoles={['admin', 'recruiter']}>
                  <CandidateCreate />
                </RoleGuard>
              }
            />

            {/* Bulk CSV Uploader (Admin only) */}
            <Route
              path="import"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <CSVImport />
                </RoleGuard>
              }
            />
          </Route>

          {/* Catch all redirect to main page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
