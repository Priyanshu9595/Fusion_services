import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, UserX, UserCheck, Plus } from 'lucide-react';
import { API_URL } from '../config/api';

const Staff = () => {
  const { token, user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading staff directory...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Directory</h1>
          <p className="text-gray-500 mt-2">Manage employee access to the FusionDocs portal.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Add Staff
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">
                      {employee.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{employee.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {employee.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <UserCheck className="w-3 h-3 mr-1" />}
                    {employee.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(employee.id)} className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors" disabled={employee.id === user.id}>
                    {employee.id === user.id ? 'Current User' : 'Remove Access'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && (
          <div className="p-8 text-center text-gray-500">No staff members found.</div>
        )}
      </div>
    </div>
  );
};

export default Staff;
