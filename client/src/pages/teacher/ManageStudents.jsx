import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  GraduationCap,
  Filter,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [search, setSearch] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    department: '',
    semester: '5',
    classSection: '',
    phone: '',
    parentPhone: '',
    admissionYear: '2024',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [dRes, cRes] = await Promise.all([
          axiosClient.get('/academic/departments'),
          axiosClient.get('/academic/classes'),
        ]);
        if (dRes.data.success) {
          setDepartments(dRes.data.data);
          if (dRes.data.data.length > 0) {
            setFormData((prev) => ({ ...prev, department: dRes.data.data[0]._id }));
          }
        }
        if (cRes.data.success) {
          setClasses(cRes.data.data);
          if (cRes.data.data.length > 0) {
            setFormData((prev) => ({ ...prev, classSection: cRes.data.data[0]._id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept) params.department = selectedDept;
      if (selectedSemester) params.semester = selectedSemester;
      if (selectedClass) params.classSection = selectedClass;
      if (search.trim()) params.search = search.trim();

      const res = await axiosClient.get('/students', { params });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedDept, selectedSemester, selectedClass, search]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      password: 'student123',
      rollNumber: '',
      department: departments[0]?._id || '',
      semester: '5',
      classSection: classes[0]?._id || '',
      phone: '',
      parentPhone: '',
      admissionYear: '2024',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (stu) => {
    setEditingStudent(stu);
    setFormData({
      name: stu.name,
      email: stu.email,
      password: '', // Blank unless modifying
      rollNumber: stu.rollNumber,
      department: stu.department?._id || stu.department || '',
      semester: stu.semester || '5',
      classSection: stu.classSection?._id || stu.classSection || '',
      phone: stu.phone || '',
      parentPhone: stu.parentPhone || '',
      admissionYear: stu.admissionYear || '2024',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      if (editingStudent) {
        // Update
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await axiosClient.put(`/students/${editingStudent._id}`, payload);
      } else {
        // Create
        await axiosClient.post('/students', formData);
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save student.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student account?')) return;
    try {
      await axiosClient.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Student Management</h1>
          <p className="text-xs text-slate-500">
            Add, update credentials, search, and manage student enrollments
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add New Student
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, register no, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Enrolled Students ({students.length})
          </h3>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading students directory..." />
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-5">Register No</th>
                  <th className="py-3 px-5">Student Details</th>
                  <th className="py-3 px-5">Department & Semester</th>
                  <th className="py-3 px-5">Class Section</th>
                  <th className="py-3 px-5">Contact Details</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu) => (
                  <tr key={stu._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      {stu.rollNumber}
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-slate-900">{stu.name}</p>
                      <p className="text-[11px] text-slate-400">{stu.email}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-medium text-slate-800">
                        {stu.department?.code || 'N/A'}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Semester {stu.semester}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
                        {stu.classSection?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{stu.phone || 'N/A'}</span>
                      </div>
                      {stu.parentPhone && (
                        <div className="text-[10px] text-slate-400">
                          Parent: {stu.parentPhone}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(stu)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Edit Student"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(stu._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Student"
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.name}` : 'Add New Student'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Register Number</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                placeholder="e.g. CS202401"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Student College Email</label>
              <input
                type="email"
                required
                disabled={!!editingStudent}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@college.edu"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {editingStudent ? 'Change Password (Optional)' : 'Initial Password'}
              </label>
              <input
                type="password"
                required={!editingStudent}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingStudent ? 'Leave blank to keep unchanged' : 'Enter initial password'}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {!editingStudent && (
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              💡 <strong>Automatic Credential Creation:</strong> Student account credentials are generated immediately. The student will use this email and initial password to log in, and can independently change their password in their profile.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Class Section</label>
              <select
                value={formData.classSection}
                onChange={(e) => setFormData({ ...formData, classSection: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
              >
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Student Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Parent Phone</label>
              <input
                type="text"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="+91 98765 11111"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
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
              disabled={formSubmitting}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {formSubmitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageStudents;
