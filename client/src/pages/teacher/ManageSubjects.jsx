import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Award, User } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    semester: '5',
    credits: '4',
    assignedTeacher: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, dRes] = await Promise.all([
        axiosClient.get('/academic/subjects'),
        axiosClient.get('/academic/departments'),
      ]);
      if (sRes.data.success) setSubjects(sRes.data.data);
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
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      department: departments[0]?._id || '',
      semester: '5',
      credits: '4',
      assignedTeacher: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub) => {
    setEditingSubject(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      department: sub.department?._id || sub.department || '',
      semester: sub.semester || '5',
      credits: sub.credits || '4',
      assignedTeacher: sub.assignedTeacher?._id || sub.assignedTeacher || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingSubject) {
        await axiosClient.put(`/academic/subjects/${editingSubject._id}`, formData);
      } else {
        await axiosClient.post('/academic/subjects', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await axiosClient.delete(`/academic/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove subject');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Curriculum & Subjects</h1>
          <p className="text-xs text-slate-500">
            Configure subjects, course codes, academic semesters, and credit allocations
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Registered Subjects ({subjects.length})
          </h3>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading curriculum..." />
        ) : subjects.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No subjects registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-5">Subject Code</th>
                  <th className="py-3 px-5">Subject Name</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Semester</th>
                  <th className="py-3 px-5">Credits</th>
                  <th className="py-3 px-5">Faculty In-Charge</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{sub.code}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800">{sub.name}</td>
                    <td className="py-3.5 px-5 text-slate-600">{sub.department?.name || 'N/A'}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-700">
                        Semester {sub.semester}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">{sub.credits} Credits</td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {sub.assignedTeacher?.name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(sub)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Subject"
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
        title={editingSubject ? `Edit Subject: ${editingSubject.code}` : 'Add New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Distributed Database Systems"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Subject Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CS506"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="6"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
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
              {saving ? 'Saving...' : editingSubject ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSubjects;
