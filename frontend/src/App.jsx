import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BOMForm from './pages/BOMForm';
import DocumentHistory from './pages/DocumentHistory';
import DocumentView from './pages/DocumentView';
import Settings from './pages/Settings';
import Customers from './pages/Customers';
import Staff from './pages/Staff';

// Layout
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Router>
      <div className="relative min-h-screen bg-slate-50 font-sans">
        {/* Global Animated Bubbles for all pages */}
        <div className="fixed top-[-10%] left-[-5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-gradient-to-br from-blue-400/40 to-indigo-400/20 rounded-full blur-[80px] pointer-events-none z-0 animate-float"></div>
        <div className="fixed bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] max-w-[700px] max-h-[700px] bg-gradient-to-br from-purple-400/40 to-pink-400/20 rounded-full blur-[90px] pointer-events-none z-0 animate-float-delayed"></div>
        <div className="fixed top-[40%] left-[60%] w-[20vw] h-[20vw] max-w-[300px] max-h-[300px] bg-gradient-to-br from-cyan-400/30 to-blue-400/10 rounded-full blur-[60px] pointer-events-none z-0 animate-float"></div>
        
        <div className="relative z-10 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/documents/new" element={<BOMForm />} />
              <Route path="/documents" element={<DocumentHistory />} />
              <Route path="/documents/:id" element={<DocumentView />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
