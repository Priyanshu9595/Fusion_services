import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowDelayedMessage(false);

    // Show a message if it takes longer than 3 seconds (Render cold start)
    const timeoutId = setTimeout(() => {
      setShowDelayedMessage(true);
    }, 3000);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Is it running?');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setShowDelayedMessage(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-50"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-purple-500 rounded-full blur-[80px] opacity-50"></div>

        <div className="relative z-20">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform rotate-3">
              <FileText className="text-white w-8 h-8 transform -rotate-3" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">FusionDocs</h1>
            <p className="text-blue-200 mt-1">Sign in to manage your documents</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-blue-200 ml-1">Username / Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-blue-300/50 transition-all outline-none"
                  placeholder="e.g. name@staff.co.in or admin"
                  required
                />
              </div>
              <p className="text-xs text-blue-300/70 ml-1 mt-1">Enter your registered @staff.co.in email or admin username.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-blue-200 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-blue-300/50 transition-all outline-none"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transform transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {showDelayedMessage && <span className="text-xs text-blue-200 mt-2 font-normal animate-pulse">Waking up server (takes ~50s on Render)...</span>}
                </div>
              ) : (
                'Sign In'
              )}
            </button>
            
            <div className="text-center mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-blue-200">
                Don't have an account?{' '}
                <Link to="/register" className="text-white font-semibold hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
