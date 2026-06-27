import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Download, Eye, FileText, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const DocumentHistory = () => {
  const { token, user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (typeFilter) query.append('type', typeFilter);

      const response = await fetch(`http://localhost:5000/api/documents?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, typeFilter, token]);

  const handleDownloadPDF = async (docId, docNumber) => {
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${docId}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${docNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Failed to download PDF');
      }
    } catch (err) {
      alert('Error downloading PDF');
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {user?.role === 'admin' ? 'Company Document History' : 'My Document History'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {user?.role === 'admin' ? 'View and manage all generated documents.' : 'View and manage documents you have created.'}
          </p>
        </div>
        <Link 
          to="/documents/new" 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all flex items-center shrink-0 transform hover:scale-105"
        >
          <span>+ Create New</span>
        </Link>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white overflow-hidden">
        {/* Filters & Search */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer or document no..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm text-slate-700 placeholder-slate-400"
            />
          </div>
          
          <div className="relative md:w-64">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-slate-400" />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none shadow-sm text-slate-700"
            >
              <option value="">All Document Types</option>
              <option value="quote">Quotes</option>
              <option value="invoice">Tax Invoices</option>
              <option value="challan">Delivery Challans</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-lg font-semibold text-slate-900">No documents found</p>
              <p className="text-sm font-medium mt-1">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Document No</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/documents/${doc.id}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Document"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => handleDownloadPDF(doc.id, doc.document_number)}
                          className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentHistory;
