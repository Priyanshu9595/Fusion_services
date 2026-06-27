import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, FileText, IndianRupee, Percent, Hash, UploadCloud, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { API_URL } from '../config/api';

const BOMForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Form State
  const [type, setType] = useState('quote');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [discount, setDiscount] = useState(0);
  
  const [items, setItems] = useState([
    { id: 1, item_name: '', hsn: '', qty: '', unit: 'Nos', unit_price: '', gst_percent: 18 }
  ]);

  // Fetch customers for dropdown
  useEffect(() => {
    fetch(`${API_URL}/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error('Failed to load customers', err));
  }, [token]);

  // Auto-fill phone when selecting existing customer
  useEffect(() => {
    const match = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
    if (match && match.phone && !customerPhone) {
      setCustomerPhone(match.phone);
    }
  }, [customerName, customers]);

  // Actions
  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), item_name: '', hsn: '', qty: '', unit: 'Nos', unit_price: '', gst_percent: 18 }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setAiLoading(true);
    try {
      const response = await fetch(`${API_URL}/documents/parse`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (response.ok && data) {
        if (data.date) {
           // Basic YYYY-MM-DD validation
           if (/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
               setDate(data.date);
           }
        }
        if (data.customer_name) {
           setCustomerName(data.customer_name);
        }
        if (data.customer_phone) {
           setCustomerPhone(data.customer_phone);
        }

        if (data.items && data.items.length > 0) {
          // Convert extracted data into our local state structure
          const newItems = data.items.map((item, idx) => ({
            id: Date.now() + idx,
            item_name: item.item_name || '',
            hsn: item.hsn || '',
            qty: item.qty || 1,
            unit: item.unit || 'Nos',
            unit_price: item.unit_price || 0,
            gst_percent: item.gst_percent || 18
          }));
          // If there's only one empty item initially, replace it. Otherwise append.
          if (items.length === 1 && !items[0].item_name && !items[0].unit_price) {
            setItems(newItems);
          } else {
            setItems([...items, ...newItems]);
          }
        } else {
          alert('AI successfully read the document, but could not find any line items or products. The text might be too blurry or complex for OCR.');
        }
      } else {
        alert(data.error || 'Failed to parse document.');
      }
    } catch (err) {
      alert('Error uploading document for AI parsing.');
    } finally {
      setAiLoading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Real-time Calculations for UI preview (backend re-calculates exactly)
  const calculateTotals = () => {
    let subtotal = 0;
    let totalGst = 0;

    items.forEach(item => {
      const lineSubtotal = (item.qty || 0) * (item.unit_price || 0);
      const lineGst = (lineSubtotal * (item.gst_percent || 0)) / 100;
      subtotal += lineSubtotal;
      totalGst += lineGst;
    });

    return {
      subtotal: subtotal.toFixed(2),
      totalGst: totalGst.toFixed(2),
      grandTotal: (subtotal + totalGst - discount).toFixed(2)
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) return alert('Please enter a customer name');
    if (items.some(item => !item.item_name || item.qty <= 0)) {
      return alert('Please fill all item names and ensure quantity is greater than 0');
    }

    setLoading(true);
    try {
      let finalCustomerId = null;
      let existingCustomer = null;
      if (customerPhone.trim()) {
        existingCustomer = customers.find(c => c.phone && c.phone === customerPhone.trim());
      }
      if (!existingCustomer) {
        existingCustomer = customers.find(c => c.name.toLowerCase() === customerName.trim().toLowerCase());
      }
      
      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else {
        // Create new customer
        const createRes = await fetch(`${API_URL}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ name: customerName.trim(), phone: customerPhone.trim(), billing_address: '', shipping_address: '', gstin: '', email: '' })
        });
        const newCust = await createRes.json();
        if (!createRes.ok) throw new Error(newCust.error || 'Failed to create customer');
        finalCustomerId = newCust.id;
      }

      const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          customer_id: finalCustomerId,
          date,
          discount: Number(discount),
          items: items.map(({ id, ...rest }) => rest) // remove temp id
        })
      });

      const data = await response.json();
      if (response.ok) {
        navigate(`/documents/${data.document_id}`);
      } else {
        alert(data.error || 'Failed to create document');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Document</h1>
          <p className="text-gray-500 mt-1">Convert your Bill of Materials into a Quote, Invoice or Challan.</p>
        </div>
        <div className="flex space-x-3 mt-1">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,application/pdf"
            className="hidden" 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={aiLoading}
            className="flex items-center text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-2.5 rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all disabled:opacity-70 shadow-[0_4px_15px_rgba(168,85,247,0.4)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.6)] transform hover:-translate-y-0.5"
          >
            {aiLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            ) : (
              <UploadCloud className="w-5 h-5 mr-2" />
            )}
            {aiLoading ? 'Auto-filling Document...' : 'AI Auto-Fill (PDF/Image)'}
          </button>
        </div>
      </div>

      {/* Step Indicator (Visual) */}
      <div className="mb-8 hidden md:flex items-center space-x-2 text-sm font-medium">
        <div className="flex items-center text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Document Details
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className="flex items-center text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Bill of Materials
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className="flex items-center text-slate-500 px-3 py-1.5">
          Tax Summary
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className="flex items-center text-slate-500 px-3 py-1.5">
          Preview & Save
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Top Details Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" /> Document Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-700"
              >
                <option value="quote">Quote</option>
                <option value="invoice">Tax Invoice</option>
                <option value="challan">Delivery Challan</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input 
                type="text"
                list="customers-list"
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Type new or select existing customer"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-700"
                required
              />
              <datalist id="customers-list">
                {customers.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
              <input 
                type="text"
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="E.g. +91 9876543210"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-700"
                required
              />
            </div>
          </div>
        </div>

        {/* BOM Items Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white p-6 md:p-8 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Hash className="w-5 h-5 mr-2 text-purple-600" /> Bill of Materials
            </h2>
            <div className="flex space-x-3">
              <button 
                type="button" 
                onClick={handleAddItem}
                className="flex items-center text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Row
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[300px]">Item Name</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">HSN</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Qty</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Unit</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-36">Price (₹)</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">GST %</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-36">Total (₹)</th>
                  <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const lineSubtotal = (item.qty || 0) * (item.unit_price || 0);
                  const lineGst = (lineSubtotal * (item.gst_percent || 0)) / 100;
                  const lineTotal = (lineSubtotal + lineGst).toFixed(2);

                  return (
                    <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={item.item_name}
                          onChange={(e) => handleItemChange(item.id, 'item_name', e.target.value)}
                          placeholder="Item description"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={item.hsn}
                          onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" 
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, 'qty', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          value={item.unit}
                          onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" 
                          min="0" step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.gst_percent}
                          onChange={(e) => handleItemChange(item.id, 'gst_percent', Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td className="p-2 font-semibold text-slate-800 text-center">
                        ₹{lineTotal}
                      </td>
                      <td className="p-2 text-center">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(item.id)}
                          className={`p-2 rounded-lg transition-colors ${items.length > 1 ? 'text-red-500 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}
                          disabled={items.length <= 1}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Calculation Summary (Bottom Row) */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-indigo-800 p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="flex flex-col sm:flex-row items-center gap-8 w-full md:w-auto">
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">Subtotal</p>
                <p className="text-xl font-bold">₹{totals.subtotal}</p>
              </div>
              <div className="hidden sm:block w-px h-10 bg-indigo-700/50"></div>
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">Total GST</p>
                <p className="text-xl font-bold">₹{totals.totalGst}</p>
              </div>
              <div className="hidden sm:block w-px h-10 bg-indigo-700/50"></div>
              <div>
                <p className="text-indigo-200 text-sm font-medium mb-1">Discount (₹)</p>
                <input 
                  type="number" 
                  min="0" step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-24 px-3 py-1.5 text-right bg-indigo-800/50 border border-indigo-600 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-white placeholder-indigo-300 transition-all font-bold"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 w-full md:w-auto">
              <div className="text-right">
                <p className="text-indigo-200 text-sm font-medium mb-1">Grand Total</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
                  ₹{totals.grandTotal}
                </p>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-white text-indigo-900 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold shadow-[0_4px_15px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center text-lg transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:transform-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><Save className="w-5 h-5 mr-2" /> Generate Document</>
                )}
              </button>
            </div>
            
          </div>
        </div>
      </form>
    </div>
  );
};

export default BOMForm;
