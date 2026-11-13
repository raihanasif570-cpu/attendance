import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Calculator,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  Award,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import { getAttendanceColorClasses } from '../../utils/attendanceUtils';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axiosClient.get('/students/me/attendance');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load student attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) return <LoadingSpinner text="Loading attendance summary..." />;

  const { overall, subjects = [], calculator = [], recentActivity = [] } = data || {};
  const overallColors = getAttendanceColorClasses(overall?.percentage || 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Student Attendance Dashboard</h1>
          <p className="text-xs text-slate-500">
            Track your semester attendance, subject progress, and minimum eligibility criteria
          </p>
        </div>
        <Link
          to="/student/calculator"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Calculator className="w-4 h-4" />
          Attendance Calculator
        </Link>
      </div>

      {/* Prominent Overall Attendance Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 ${overallColors.bg} ${overallColors.border}`}
          >
            <span className={`text-2xl font-black ${overallColors.text}`}>
              {overall?.percentage || 0}%
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Overall
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Semester Attendance Standing</h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${overallColors.badge}`}>
                {overallColors.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              {overall?.percentage >= 75
                ? 'Great job! Your attendance is above the mandatory 75% college exam requirement.'
                : 'Warning: Your attendance is below the mandatory 75% threshold. Check the calculator below for required classes.'}
            </p>
          </div>
        </div>

        {/* 3 Metric counters */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase">Total Classes</p>
            <p className="text-xl font-bold text-slate-900">{overall?.totalClasses || 0}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase">Present</p>
            <p className="text-xl font-bold text-emerald-600">{overall?.presentClasses || 0}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase">Absent</p>
            <p className="text-xl font-bold text-rose-600">{overall?.absentClasses || 0}</p>
          </div>
        </div>
      </div>

      {/* Subject-Wise Progress Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Subject-Wise Attendance</h3>
          <Link
            to="/student/subjects"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <span>Detailed Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const colors = getAttendanceColorClasses(sub.percentage);
            return (
              <div
                key={sub.subjectId}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {sub.subjectCode}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {sub.percentage}%
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{sub.subjectName}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Attended <strong>{sub.present}</strong> of <strong>{sub.total}</strong> sessions
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <ProgressBar percentage={sub.percentage} showLabel={false} size="sm" />
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                    <span>Missed: {sub.absent} classes</span>
                    <span className={colors.text}>{colors.label.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculator Milestones & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Goals (75%, 80%, 85%, 90%) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-900" />
              <h3 className="text-sm font-bold text-slate-900">Attendance Target Milestones</h3>
            </div>
            <Link
              to="/student/calculator"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
            >
              Open Interactive Calculator
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {calculator.map((item) => {
              const isAchieved = (overall?.percentage || 0) >= item.target;

              return (
                <div
                  key={item.target}
                  className={`p-4 rounded-xl border transition-all ${
                    isAchieved
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">Target: {item.target}%</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAchieved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isAchieved ? 'Achieved' : 'Action Required'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.status}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent 5 Attendance Logs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Class Logs</h3>
              <Link
                to="/student/calendar"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
              >
                <span>Calendar</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentActivity.slice(0, 5).map((log) => {
                const isPres = log.status === 'Present' || log.status === 'Late';
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                        {log.subject}
                      </p>
                      <p className="text-[10px] text-slate-400">{log.date}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isPres
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
