import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Send, Phone } from 'lucide-react';

const DocumentView = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/documents/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setDoc(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${id}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.document_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      alert('Error downloading PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      // Get the shareable public link from the backend
      const response = await fetch(`http://localhost:5000/api/documents/${id}/share`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (!response.ok) {
        alert('Could not generate share link');
        return;
      }

      // Prepare the WhatsApp message with the link
      const text = `Hello ${doc.customer_name},\n\nPlease find the details for your ${doc.type} (${doc.document_number}) from FusionDocs.\n\nGrand Total: ₹${doc.grand_total}\nDate: ${doc.date}\n\nYou can view and download your PDF securely here:\n${data.link}\n\nThank you for your business!`;
      const encodedText = encodeURIComponent(text);
      
      // Format phone number if available
      let phoneParam = '';
      if (doc.phone) {
        const cleanPhone = doc.phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) {
          phoneParam = `91${cleanPhone}`;
        } else {
          phoneParam = cleanPhone;
        }
      }
      
      const url = `https://wa.me/${phoneParam}?text=${encodedText}`;
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
      alert('Error sharing to WhatsApp');
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!doc) return <div className="text-center p-20 text-gray-500">Document not found</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/documents" className="mr-4 p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {doc.document_number}
              <span className="ml-3 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                {doc.type}
              </span>
            </h1>
            <p className="text-gray-500 mt-1">Generated on {doc.date}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={handleWhatsAppShare}
            className="flex items-center px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <Send className="w-4 h-4 mr-2" /> Share on WhatsApp
          </button>
          
          <button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            {downloading ? (
               <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Preview header */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
            <p className="text-lg font-bold text-gray-900">{doc.customer_name}</p>
            <p className="text-gray-600 mt-1 max-w-xs">{doc.billing_address}</p>
            {doc.customer_gstin && <p className="text-gray-600 mt-1">GSTIN: {doc.customer_gstin}</p>}
            {doc.phone && <p className="text-gray-600 mt-1 flex items-center"><Phone className="w-4 h-4 mr-1"/> {doc.phone}</p>}
          </div>
          <div className="text-left md:text-right">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Document Info</h3>
            <p className="text-gray-600"><strong>No:</strong> {doc.document_number}</p>
            <p className="text-gray-600 mt-1"><strong>Date:</strong> {doc.date}</p>
            <p className="text-gray-600 mt-1"><strong>Status:</strong> <span className="capitalize">{doc.status}</span></p>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Line Items</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">GST %</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doc.items && doc.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{item.item_name} {item.hsn && <span className="text-xs text-gray-400 ml-1">({item.hsn})</span>}</td>
                    <td className="px-4 py-3 text-gray-600">{item.qty} {item.unit}</td>
                    <td className="px-4 py-3 text-gray-600">₹{item.unit_price}</td>
                    <td className="px-4 py-3 text-gray-600">{item.gst_percent}%</td>
                    <td className="px-4 py-3 text-gray-900 font-medium text-right">₹{item.line_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{doc.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total GST</span>
              <span>₹{doc.total_gst}</span>
            </div>
            {/* If there was a discount calculated, subtotal + gst - grand_total = discount */}
            {Number(doc.subtotal) + Number(doc.total_gst) - Number(doc.grand_total) > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>- ₹{(Number(doc.subtotal) + Number(doc.total_gst) - Number(doc.grand_total)).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
              <span className="text-xl font-bold text-gray-800">Grand Total</span>
              <span className="text-2xl font-bold text-blue-600">₹{doc.grand_total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentView;
