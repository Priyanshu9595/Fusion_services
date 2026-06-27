import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings as SettingsIcon, LogOut, FilePlus, Menu, Contact } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50/50 text-indigo-700 font-bold border-l-4 border-indigo-600 shadow-sm'
          : 'text-slate-600 hover:bg-slate-100/60 hover:text-indigo-900 border-l-4 border-transparent'
      }`
    }
  >
    <Icon className="w-5 h-5 mr-3" />
    {label}
  </NavLink>
);

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex h-screen font-sans bg-saas-pattern">
      {/* Sidebar */}
      <aside className="w-64 bg-white/70 backdrop-blur-2xl border-r border-white flex flex-col shadow-[8px_0_30px_rgba(0,0,0,0.03)] z-10 hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
            <FileText className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight">
            FusionDocs
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end />
          
          <div className="mt-8 mb-4">
            <p className="px-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Documents</p>
          </div>
          <SidebarItem to="/documents/new" icon={FilePlus} label="Create New" />
          <SidebarItem to="/documents" icon={FileText} label="History" />

          <SidebarItem to="/customers" icon={Contact} label="Customers" />

          {isAdmin && (
            <div className="mt-8 mb-4">
              <p className="px-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Management</p>
            </div>
          )}
          {isAdmin && <SidebarItem to="/staff" icon={Users} label="Staff Directory" />}
          {isAdmin && <SidebarItem to="/settings" icon={SettingsIcon} label="Company Profile" />}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-500 transition-colors rounded-xl hover:bg-red-50 hover:text-red-600 font-medium"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden z-10">
        {/* Header */}
        <header className="h-20 bg-white/70 backdrop-blur-2xl border-b border-white flex items-center justify-between px-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] z-20">
          <div className="flex items-center md:hidden">
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="ml-3 text-xl font-bold text-gray-800">FusionDocs</h1>
          </div>
          
          <div className="hidden md:block">
            {/* Contextual Title could go here */}
          </div>

          <div className="flex items-center">
            <div className="flex items-center space-x-3 p-1.5 pr-4 bg-white/50 rounded-full border border-slate-200 shadow-sm transition-all hover:bg-white hover:shadow-md cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200 text-indigo-700 font-bold shadow-inner">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.username}</p>
                <p className="text-xs text-indigo-500 font-medium capitalize leading-tight">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-transparent">
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
