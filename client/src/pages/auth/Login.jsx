import React, { useState, useContext } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated, error, setError } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error is caught and stored in context
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role) => {
    setError(null);
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('password123');
    } else if (role === 'recruiter') {
      setEmail('recruiter@example.com');
      setPassword('password123');
    } else if (role === 'employer') {
      setEmail('employer@example.com');
      setPassword('password123');
    } else if (role === 'jobseeker') {
      setEmail('seeker@example.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full glass-panel bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-md">
            W
          </div>
          <h1 className="mt-4 text-2xl font-bold font-headline text-white">
            WyreFlow Platform
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-body">
            Enterprise recruitment and candidate system
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">gpp_bad</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/40 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-body text-sm"
              placeholder="e.g. admin@recruitment.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/40 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-body text-sm"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 font-headline"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Link to Register page */}
        <div className="text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-all">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Demo Credentials Helper */}
        <div className="border-t border-slate-700/60 pt-4 space-y-3">
          <p className="text-xs text-slate-400 text-center font-body">
            Quick Fill Demo Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="px-2 py-2 bg-slate-950/45 hover:bg-slate-750 border border-slate-700 text-xs text-slate-300 font-semibold rounded-lg transition-all"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('recruiter')}
              className="px-2 py-2 bg-slate-950/45 hover:bg-slate-750 border border-slate-700 text-xs text-slate-300 font-semibold rounded-lg transition-all"
            >
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('employer')}
              className="px-2 py-2 bg-slate-950/45 hover:bg-slate-750 border border-slate-700 text-xs text-slate-300 font-semibold rounded-lg transition-all"
            >
              Employer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('jobseeker')}
              className="px-2 py-2 bg-slate-950/45 hover:bg-slate-750 border border-slate-700 text-xs text-slate-300 font-semibold rounded-lg transition-all"
            >
              Jobseeker
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
