import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import { getAttendanceColorClasses } from '../../utils/attendanceUtils';

const AttendanceReports = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [reportData, setReportData] = useState([]);
  const [reportMeta, setReportMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load initial classes & subjects
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          axiosClient.get('/academic/classes'),
          axiosClient.get('/academic/subjects'),
        ]);
        if (cRes.data.success && cRes.data.data.length > 0) {
          setClasses(cRes.data.data);
          setSelectedClass(cRes.data.data[0]._id);
        }
        if (sRes.data.success) {
          setSubjects(sRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchMeta();
  }, []);

  const generateReport = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const params = { classSection: selectedClass };
      if (selectedSubject) params.subject = selectedSubject;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axiosClient.get('/reports/summary', { params });
      if (res.data.success) {
        setReportData(res.data.data);
        setReportMeta(res.data.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      generateReport();
    }
  }, [selectedClass, selectedSubject, startDate, endDate]);

  const handleExportCSV = () => {
    if (!selectedClass) return;
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      classSection: selectedClass,
      ...(selectedSubject && { subject: selectedSubject }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    // Direct download trigger with authorization
    fetch(`/api/reports/export-csv?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert('Export failed: ' + err.message));
  };

  const handlePrint = () => {
    window.print();
  };

  if (initialLoading) return <LoadingSpinner text="Preparing reports..." />;

  const currentClassObj = classes.find((c) => c._id === selectedClass);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Attendance Audit & Reports</h1>
          <p className="text-xs text-slate-500">
            Generate cumulative class reports, shortage lists, and export official CSV records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Filter Selector Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Class Section</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} (Semester {c.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Subject (Optional)</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="">All Subjects (Cumulative)</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block mb-6">
        <h2 className="text-xl font-bold text-slate-900">Official College Attendance Report</h2>
        <p className="text-xs text-slate-600 mt-1">
          Class: <strong>{currentClassObj?.name}</strong> | Department:{' '}
          <strong>{currentClassObj?.department?.name || 'Academic'}</strong> | Generated on:{' '}
          {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Summary KPI Cards */}
      {reportMeta && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Sessions Held"
            value={reportMeta.totalSessions}
            subtitle="Recorded classroom lectures"
          />
          <StatCard
            title="Total Students"
            value={reportMeta.totalStudents}
            subtitle="Enrolled in this section"
          />
          <StatCard
            title="Class Average"
            value={`${reportMeta.averagePercentage}%`}
            subtitle="Mean attendance rate"
            color={
              reportMeta.averagePercentage >= 85
                ? 'green'
                : reportMeta.averagePercentage >= 75
                ? 'yellow'
                : 'red'
            }
          />
          <StatCard
            title="Defaulters (< 75%)"
            value={reportMeta.defaultersCount}
            subtitle="Students ineligible for exams"
            color={reportMeta.defaultersCount > 0 ? 'red' : 'green'}
          />
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between no-print">
          <h3 className="text-sm font-semibold text-slate-900">
            Student Attendance Roster ({reportData.length})
          </h3>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>&ge; 85% Eligible</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>75-84% Borderline</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>&lt; 75% Defaulter</span>
            </span>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Compiling report data..." />
        ) : reportData.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No attendance records match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Roll No</th>
                  <th className="py-3 px-5">Student Name</th>
                  <th className="py-3 px-5 text-center">Total Held</th>
                  <th className="py-3 px-5 text-center">Attended</th>
                  <th className="py-3 px-5 text-center">Absent</th>
                  <th className="py-3 px-5 w-44">Attendance Progress</th>
                  <th className="py-3 px-5 text-right">Eligibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((s) => {
                  const colors = getAttendanceColorClasses(s.percentage);

                  return (
                    <tr
                      key={s.studentId}
                      className={`transition-colors ${
                        s.percentage < 75 ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="py-3 px-5 font-mono font-bold text-slate-900">{s.rollNumber}</td>
                      <td className="py-3 px-5 font-semibold text-slate-900">{s.name}</td>
                      <td className="py-3 px-5 text-center text-slate-600 font-medium">
                        {s.totalClasses}
                      </td>
                      <td className="py-3 px-5 text-center font-bold text-emerald-700">
                        {s.presentClasses}
                      </td>
                      <td className="py-3 px-5 text-center font-semibold text-rose-600">
                        {s.absentClasses}
                      </td>
                      <td className="py-3 px-5">
                        <ProgressBar percentage={s.percentage} showLabel={false} size="sm" />
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${colors.badge}`}
                        >
                          {s.percentage}% - {colors.label.split(' ')[0]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceReports;
