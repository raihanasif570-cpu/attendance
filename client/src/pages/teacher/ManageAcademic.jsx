import React, { useState, useEffect } from 'react';
import { GraduationCap, Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ManageAcademic = () => {
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' or 'departments'
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Class Modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({
    name: '',
    department: '',
    semester: '5',
    section: 'A',
    academicYear: '2026-2027',
  });

  // Dept Modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dRes, cRes] = await Promise.all([
        axiosClient.get('/academic/departments'),
        axiosClient.get('/academic/classes'),
      ]);
      if (dRes.data.success) {
        setDepartments(dRes.data.data);
        if (dRes.data.data.length > 0 && !classForm.department) {
          setClassForm((prev) => ({ ...prev, department: dRes.data.data[0]._id }));
        }
      }
      if (cRes.data.success) setClasses(cRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await axiosClient.put(`/academic/classes/${editingClass._id}`, classForm);
      } else {
        await axiosClient.post('/academic/classes', classForm);
      }
      setIsClassModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save class');
    }
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/academic/departments', deptForm);
      setIsDeptModalOpen(false);
      setDeptForm({ name: '', code: '', description: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add department');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Delete this class section?')) return;
    try {
      await axiosClient.delete(`/academic/classes/${id}`);
      setClasses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert('Failed to remove class');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Academic Structure</h1>
          <p className="text-xs text-slate-500">
            Configure college departments, class divisions, and academic sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'classes' ? (
            <button
              onClick={() => {
                setEditingClass(null);
                setClassForm({
                  name: '',
                  department: departments[0]?._id || '',
                  semester: '5',
                  section: 'A',
                  academicYear: '2026-2027',
                });
                setIsClassModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Class Section
            </button>
          ) : (
            <button
              onClick={() => setIsDeptModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Department
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'classes'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Class Sections ({classes.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'departments'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Departments ({departments.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Loading academic structure..." />
      ) : activeTab === 'classes' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-5">Class Name</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5">Semester</th>
                  <th className="py-3 px-5">Section</th>
                  <th className="py-3 px-5">Academic Year</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-5 text-slate-600">{c.department?.name || 'N/A'}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-700">
                        Semester {c.semester}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800">Sec {c.section}</td>
                    <td className="py-3.5 px-5 text-slate-500">{c.academicYear}</td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        onClick={() => handleDeleteClass(c._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono font-bold text-xs">
                    {d.code}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{d.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {d.description || 'College academic department'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title="Create Class Section"
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Class Name (e.g. CSE-5A)
            </label>
            <input
              type="text"
              required
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              placeholder="e.g. CSE-5A"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <select
                value={classForm.department}
                onChange={(e) => setClassForm({ ...classForm, department: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Semester</label>
              <select
                value={classForm.semester}
                onChange={(e) => setClassForm({ ...classForm, semester: e.target.value })}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Division / Section</label>
              <input
                type="text"
                required
                value={classForm.section}
                onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                placeholder="A"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                required
                value={classForm.academicYear}
                onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })}
                placeholder="2026-2027"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsClassModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Save Class Section
            </button>
          </div>
        </form>
      </Modal>

      {/* Dept Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Add Academic Department"
      >
        <form onSubmit={handleSaveDept} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Department Name</label>
            <input
              type="text"
              required
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              placeholder="e.g. Mechanical Engineering"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Code</label>
            <input
              type="text"
              required
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              placeholder="e.g. MECH"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Add Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageAcademic;
