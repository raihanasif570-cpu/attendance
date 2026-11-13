import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Eye,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { getAttendanceColorClasses } from '../../utils/attendanceUtils';

const AttendanceHistory = () => {
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inspection modal
  const [inspectRecord, setInspectRecord] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(false);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [deptRes, classRes, subRes] = await Promise.all([
          axiosClient.get('/academic/departments'),
          axiosClient.get('/academic/classes'),
          axiosClient.get('/academic/subjects'),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.data);
        if (classRes.data.success) setClasses(classRes.data.data);
        if (subRes.data.success) setSubjects(subRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept) params.department = selectedDept;
      if (selectedClass) params.classSection = selectedClass;
      if (selectedSubject) params.subject = selectedSubject;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axiosClient.get('/attendance/history', { params });
      if (res.data.success) {
        setHistoryList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedDept, selectedClass, selectedSubject, startDate, endDate]);

  const handleInspect = async (id) => {
    try {
      setLoadingRecord(true);
      const res = await axiosClient.get(`/attendance/${id}`);
      if (res.data.success) {
        setInspectRecord(res.data.data);
      }
    } catch (err) {
      alert('Failed to load session details');
    } finally {
      setLoadingRecord(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
      return;
    }
    try {
      await axiosClient.delete(`/attendance/${id}`);
      setHistoryList((prev) => prev.filter((r) => r._id !== id));
      if (inspectRecord?._id === id) setInspectRecord(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Attendance Session History</h1>
        <p className="text-xs text-slate-500">
          Review, inspect individual student marks, or remove historical attendance records
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Class Section</label>
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

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Recorded Sessions ({historyList.length})
          </h3>
          {(selectedDept || selectedClass || selectedSubject || startDate || endDate) && (
            <button
              onClick={() => {
                setSelectedDept('');
                setSelectedClass('');
                setSelectedSubject('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading history..." />
        ) : historyList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No attendance sessions found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Subject</th>
                  <th className="py-3 px-5">Class Section</th>
                  <th className="py-3 px-5">Marked By</th>
                  <th className="py-3 px-5">Present / Total</th>
                  <th className="py-3 px-5">Percentage</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyList.map((row) => {
                  const pct =
                    row.totalStudents > 0
                      ? Math.round((row.presentCount / row.totalStudents) * 100)
                      : 0;
                  const colors = getAttendanceColorClasses(pct);

                  return (
                    <tr key={row._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">{row.dateString}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-medium text-slate-800">{row.subject?.name}</span>
                        <span className="ml-1 text-[10px] text-slate-400 font-mono">
                          ({row.subject?.code})
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{row.classSection?.name}</td>
                      <td className="py-3.5 px-5 text-slate-600">{row.teacher?.name}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-900">{row.presentCount}</span>
                        <span className="text-slate-400"> / {row.totalStudents}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${colors.badge}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-1">
                        <button
                          onClick={() => handleInspect(row._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Inspect Student List"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Single Session Modal */}
      {inspectRecord && (
        <Modal
          isOpen={!!inspectRecord}
          onClose={() => setInspectRecord(null)}
          title={`Session Details: ${inspectRecord.subject?.name} (${inspectRecord.dateString})`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <div>
                <p>
                  Class: <strong>{inspectRecord.classSection?.name}</strong> | Subject:{' '}
                  <strong>{inspectRecord.subject?.code}</strong>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Marked by {inspectRecord.teacher?.name} on{' '}
                  {new Date(inspectRecord.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-900">
                  {inspectRecord.presentCount} / {inspectRecord.totalStudents}
                </span>
                <span className="block text-[10px] text-slate-500">Present</span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Roll No</th>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspectRecord.records?.map((r, idx) => {
                    const isPres = r.status === 'Present' || r.status === 'Late';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                          {r.student?.rollNumber || 'N/A'}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-800">
                          {r.student?.name || 'Unknown'}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPres
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 italic text-[11px]">
                          {r.remarks || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectRecord(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AttendanceHistory;
