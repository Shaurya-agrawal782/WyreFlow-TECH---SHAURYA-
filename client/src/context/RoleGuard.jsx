import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

/**
 * Route wrapper to restrict access to logged-in users only.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div class="flex items-center justify-center h-screen bg-background">
        <div class="animate-pulse space-y-4">
          <div class="h-12 w-48 bg-slate-200 rounded-md"></div>
          <div class="h-6 w-32 bg-slate-200 rounded-md mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * Route guard to restrict access to specific roles (e.g. admin, recruiter).
 */
export const RoleGuard = ({ allowedRoles, children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div class="flex items-center justify-center h-screen bg-background">
        <div class="animate-pulse space-y-4">
          <div class="h-12 w-48 bg-slate-200 rounded-md"></div>
          <div class="h-6 w-32 bg-slate-200 rounded-md mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // 403 Forbidden Page style
    return (
      <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div class="text-center max-w-md">
          <span class="material-symbols-outlined text-6xl text-red-500 mb-4">gpp_bad</span>
          <h1 class="text-3xl font-bold font-headline text-slate-900 mb-2">403 Forbidden</h1>
          <p class="text-slate-600 mb-6 font-body">
            You do not have authorization to view this page. If you believe this is in error, please contact your administrator.
          </p>
          <a
            href="/"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none"
          >
            Go Back Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};
