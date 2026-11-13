import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Save,
  Search,
  AlertCircle,
  Check,
  RotateCcw,
  Clock,
  Sparkles,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MarkAttendance = () => {
  // Selections
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('5');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance Sheet Data
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [lastMarkedInfo, setLastMarkedInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // 1. Fetch initial departments, classes, subjects
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoadingInitial(true);
        const [deptRes, classRes, subRes] = await Promise.all([
          axiosClient.get('/academic/departments'),
          axiosClient.get('/academic/classes'),
          axiosClient.get('/academic/subjects'),
        ]);

        if (deptRes.data.success && deptRes.data.data.length > 0) {
          setDepartments(deptRes.data.data);
          setSelectedDept(deptRes.data.data[0]._id);
        }
        if (classRes.data.success) {
          setClasses(classRes.data.data);
        }
        if (subRes.data.success) {
          setSubjects(subRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load academic metadata:', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchMetadata();
  }, []);

  // Filter classes according to selected department & semester
  const availableClasses = classes.filter(
    (c) =>
      (!selectedDept || c.department?._id === selectedDept || c.department === selectedDept) &&
      (!selectedSemester || c.semester === Number(selectedSemester))
  );

  // Filter subjects according to selected department & semester
  const availableSubjects = subjects.filter(
    (s) =>
      (!selectedDept || s.department?._id === selectedDept || s.department === selectedDept) &&
      (!selectedSemester || s.semester === Number(selectedSemester))
  );

  // Auto-select first matching class and subject when department/semester changes
  useEffect(() => {
    if (availableClasses.length > 0 && (!selectedClass || !availableClasses.some((c) => c._id === selectedClass))) {
      setSelectedClass(availableClasses[0]._id);
    }
  }, [selectedDept, selectedSemester, classes]);

  useEffect(() => {
    if (
      availableSubjects.length > 0 &&
      (!selectedSubject || !availableSubjects.some((s) => s._id === selectedSubject))
    ) {
      setSelectedSubject(availableSubjects[0]._id);
    }
  }, [selectedDept, selectedSemester, subjects]);

  // Load Attendance Sheet whenever class, subject, date are set
  const loadAttendanceSheet = async () => {
    if (!selectedDept || !selectedSemester || !selectedClass || !selectedSubject || !selectedDate) {
      return;
    }

    try {
      setLoadingSheet(true);
      setNotification(null);

      const res = await axiosClient.get('/attendance/sheet', {
        params: {
          department: selectedDept,
          semester: selectedSemester,
          classSection: selectedClass,
          subject: selectedSubject,
          date: selectedDate,
        },
      });

      if (res.data.success) {
        setStudentsList(res.data.data);
        setIsEditMode(res.data.isEditMode);
        if (res.data.isEditMode) {
          setLastMarkedInfo({
            teacher: res.data.lastMarkedBy,
            time: res.data.lastMarkedAt,
          });
        } else {
          setLastMarkedInfo(null);
        }
      }
    } catch (err) {
      console.error('Error loading attendance sheet:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load students for this class',
      });
      setStudentsList([]);
    } finally {
      setLoadingSheet(false);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedDate) {
      loadAttendanceSheet();
    }
  }, [selectedClass, selectedSubject, selectedDate]);

  // Toggle single student status
  const toggleStudentStatus = (studentId) => {
    setStudentsList((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          const nextStatus = s.status === 'Present' ? 'Absent' : 'Present';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  // Mark All Present
  const markAllPresent = () => {
    setStudentsList((prev) => prev.map((s) => ({ ...s, status: 'Present' })));
  };

  // Mark All Absent
  const markAllAbsent = () => {
    setStudentsList((prev) => prev.map((s) => ({ ...s, status: 'Absent' })));
  };

  // Save Attendance (Duplicate Prevention logic handled on server)
  const handleSaveAttendance = async () => {
    if (studentsList.length === 0) {
      alert('No students found to save attendance.');
      return;
    }

    try {
      setSaving(true);
      setNotification(null);

      const payload = {
        department: selectedDept,
        semester: Number(selectedSemester),
        classSection: selectedClass,
        subject: selectedSubject,
        date: selectedDate,
        records: studentsList.map((s) => ({
          studentId: s.studentId,
          status: s.status,
          remarks: s.remarks || '',
        })),
      };

      const res = await axiosClient.post('/attendance/save', payload);

      if (res.data.success) {
        setNotification({
          type: 'success',
          message:
            res.data.action === 'updated'
              ? 'Attendance records updated successfully! (Edit Mode)'
              : 'Attendance submitted and saved successfully!',
        });
        setIsEditMode(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save attendance.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) return <LoadingSpinner text="Loading academic classes..." />;

  // Filter students based on search
  const filteredStudents = studentsList.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.rollNumber?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
  });

  const presentCount = studentsList.filter((s) => s.status === 'Present' || s.status === 'Late').length;
  const absentCount = studentsList.filter((s) => s.status === 'Absent').length;
  const attendancePct =
    studentsList.length > 0 ? Math.round((presentCount / studentsList.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Mark Student Attendance</h1>
        <p className="text-xs text-slate-500">
          Select class parameters to load the student roll and record attendance
        </p>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4-Step Selection Filter Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Step 1 to 4: Class & Session Selection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Step 1: Department */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">1. Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2a: Semester */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">2. Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2b: Class */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Class Section</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {availableClasses.length === 0 ? (
                <option value="">No classes found</option>
              ) : (
                availableClasses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.academicYear})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Step 3: Subject */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">3. Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {availableSubjects.length === 0 ? (
                <option value="">No subjects found</option>
              ) : (
                availableSubjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Step 4: Date */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">4. Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Edit Mode Alert Banner */}
      {isEditMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Edit Mode Active:</span> Attendance for this subject and date has already been recorded
              {lastMarkedInfo?.teacher ? ` by ${lastMarkedInfo.teacher}` : ''}. Changes will update the existing record cleanly.
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-200/80 font-bold text-[10px]">
            Duplicate Protected
          </span>
        </div>
      )}

      {/* Step 5 to 7: Students Roll Call and Marking */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-900">
              Students Roster ({studentsList.length})
            </h3>
            {studentsList.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  {presentCount} Present
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                  {absentCount} Absent
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                  {attendancePct}%
                </span>
              </div>
            )}
          </div>

          {/* Quick Mark & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search roll no or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="button"
              onClick={markAllPresent}
              disabled={studentsList.length === 0}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              Mark All Present
            </button>

            <button
              type="button"
              onClick={markAllAbsent}
              disabled={studentsList.length === 0}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Student Table / Cards */}
        {loadingSheet ? (
          <LoadingSpinner text="Fetching student roll..." />
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            {studentsList.length === 0
              ? 'No enrolled students found in this class section. Please select a different class or add students.'
              : 'No students match your search filter.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-5">Roll No</th>
                  <th className="py-3 px-5">Student Name</th>
                  <th className="py-3 px-5 hidden sm:table-cell">Email</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 hidden md:table-cell">Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => {
                  const isPresent = stu.status === 'Present' || stu.status === 'Late';

                  return (
                    <tr
                      key={stu.studentId}
                      className={`transition-colors ${
                        isPresent ? 'hover:bg-emerald-50/30' : 'bg-rose-50/30 hover:bg-rose-50/50'
                      }`}
                    >
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        {stu.rollNumber}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-900">{stu.name}</span>
                        {stu.phone && (
                          <span className="block text-[10px] text-slate-400">{stu.phone}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 hidden sm:table-cell">
                        {stu.email}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(stu.studentId)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
                            isPresent
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-rose-600 text-white hover:bg-rose-700'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>Absent</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-5 hidden md:table-cell">
                        <input
                          type="text"
                          placeholder="e.g. Leave, Late..."
                          value={stu.remarks || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStudentsList((prev) =>
                              prev.map((s) =>
                                s.studentId === stu.studentId ? { ...s, remarks: val } : s
                              )
                            );
                          }}
                          className="w-full text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Save Footer Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-500">
            {studentsList.length > 0 && (
              <span>
                Saving attendance for <strong>{studentsList.length}</strong> students on <strong>{selectedDate}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={saving || studentsList.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Records...' : isEditMode ? 'Update Attendance Sheet' : 'Save Attendance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
