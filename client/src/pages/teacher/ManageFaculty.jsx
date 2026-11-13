import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Mail, Phone, Building2, Trash2, Edit2, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

const ManageFaculty = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    designation: 'Assistant Professor',
    department: '',
    phone: '',
    employeeId: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, dRes] = await Promise.all([
        axiosClient.get('/teachers'),
        axiosClient.get('/academic/departments'),
      ]);
      if (tRes.data.success) setTeachers(tRes.data.data);
      if (dRes.data.success) {
        setDepartments(dRes.data.data);
        if (dRes.data.data.length > 0 && !formData.department) {
          setFormData((prev) => ({ ...prev, department: dRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      designation: 'Assistant Professor',
      department: departments[0]?._id || '',
      phone: '',
      employeeId: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      email: t.email,
      password: '',
      designation: t.designation || 'Assistant Professor',
      department: t.department?._id || t.department || '',
      phone: t.phone || '',
      employeeId: t.employeeId || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingTeacher) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await axiosClient.put(`/teachers/${editingTeacher._id}`, payload);
      } else {
        await axiosClient.post('/teachers', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save teacher account.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this teacher account?')) return;
    try {
      await axiosClient.delete(`/teachers/${id}`);
      setTeachers((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate teacher.');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 mt-1">
          Only authorized administrators can create and manage additional teacher accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Faculty & Teacher Accounts</h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-bold text-[10px]">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Securely create and authorize additional teacher accounts for the institution
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Create Teacher Account
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Authorized Faculty ({teachers.length})</h3>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading faculty directory..." />
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No faculty accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-5">Teacher Details</th>
                  <th className="py-3 px-5">Employee ID</th>
                  <th className="py-3 px-5">Designation</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Phone</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{t.name}</span>
                        {t.role === 'admin' && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 text-[9px] font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{t.email}</span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-medium text-slate-800">{t.employeeId || 'N/A'}</td>
                    <td className="py-3.5 px-5 text-slate-600">{t.designation || 'Faculty'}</td>
                    <td className="py-3.5 px-5 text-slate-600">{t.department?.name || 'General'}</td>
                    <td className="py-3.5 px-5 text-slate-500">{t.phone || 'N/A'}</td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Edit Teacher"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Deactivate Teacher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? `Edit Faculty: ${editingTeacher.name}` : 'Create Teacher Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Faculty Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Alan Turing"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="e.g. EMP-CSE-105"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                required
                disabled={!!editingTeacher}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="faculty@college.edu"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {editingTeacher ? 'Change Password (Optional)' : 'Initial Password'}
              </label>
              <input
                type="password"
                required={!editingTeacher}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Associate Professor"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 00000"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingTeacher ? 'Update Account' : 'Create Teacher Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageFaculty;
