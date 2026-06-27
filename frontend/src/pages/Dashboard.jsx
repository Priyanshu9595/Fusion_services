import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, FileBadge, Truck, ArrowRight, TrendingUp, FilePlus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, trend }) => (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] duration-300">
    <div>
      <p className="text-sm font-semibold text-slate-500 mb-2 tracking-wide uppercase">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${bgClass}`}>
      <Icon className={`w-7 h-7 ${colorClass}`} />
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ totalQuotes: 0, totalInvoices: 0, totalChallans: 0, recentDocuments: [] });
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {user?.role === 'admin' ? 'Company Overview' : 'My Overview'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Welcome back, <span className="text-indigo-600">{user?.username}</span>. Here is what's happening today.</p>
        </div>
        <Link 
          to="/documents/new" 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all flex items-center transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" /> Create Document
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Quotes" 
          value={stats.totalQuotes} 
          icon={FileText} 
          colorClass="text-blue-600" 
          bgClass="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200" 
        />
        <StatCard 
          title="Tax Invoices" 
          value={stats.totalInvoices} 
          icon={FileBadge} 
          colorClass="text-purple-600" 
          bgClass="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200" 
        />
        <StatCard 
          title="Delivery Challans" 
          value={stats.totalChallans} 
          icon={Truck} 
          colorClass="text-emerald-600" 
          bgClass="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/documents/new" className="group bg-white/60 backdrop-blur-sm border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 flex items-center transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <FilePlus className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h4 className="font-semibold text-slate-800">Create Quote</h4>
            <p className="text-xs text-slate-500">Draft a new proposal</p>
          </div>
        </Link>
        <Link to="/documents/new" className="group bg-white/60 backdrop-blur-sm border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 flex items-center transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
            <FileBadge className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h4 className="font-semibold text-slate-800">Create Invoice</h4>
            <p className="text-xs text-slate-500">Bill your customers</p>
          </div>
        </Link>
        <Link to="/documents/new" className="group bg-white/60 backdrop-blur-sm border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 flex items-center transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <Truck className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h4 className="font-semibold text-slate-800">Create Challan</h4>
            <p className="text-xs text-slate-500">Generate delivery note</p>
          </div>
        </Link>
      </div>

      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" /> {user?.role === 'admin' ? 'Recent Company Documents' : 'My Recent Documents'}
          </h2>
          <Link to="/documents" className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 flex items-center transition-colors">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {stats.recentDocuments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No documents generated yet. Create your first quote or invoice!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Document No</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-900">{doc.document_number}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full capitalize
                        ${doc.type === 'quote' ? 'bg-blue-100/80 text-blue-700 border border-blue-200' : 
                          doc.type === 'invoice' ? 'bg-purple-100/80 text-purple-700 border border-purple-200' : 
                          'bg-emerald-100/80 text-emerald-700 border border-emerald-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${doc.type === 'quote' ? 'bg-blue-500' : doc.type === 'invoice' ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{doc.customer_name || 'Walk-in'}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{doc.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{Number(doc.grand_total).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
