import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  UserCheck,
  UserX,
  TrendingUp,
  CheckSquare,
  BarChart3,
  UserPlus,
  ArrowRight,
  Clock,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { getAttendanceColorClasses } from '../../utils/attendanceUtils';

const TeacherDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axiosClient.get('/attendance/dashboard/metrics');
        if (res.data.success) {
          setMetrics(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard metrics..." />;

  const {
    totalStudents = 0,
    totalSubjects = 0,
    todayPresent = 0,
    todayAbsent = 0,
    averageAttendance = 0,
    recentActivity = [],
    trend = [],
  } = metrics || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Faculty Dashboard</h1>
          <p className="text-xs text-slate-500">Real-time attendance overview and quick actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/teacher/mark-attendance"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <CheckSquare className="w-4 h-4" />
            Mark Attendance
          </Link>
          <Link
            to="/teacher/reports"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <BarChart3 className="w-4 h-4" />
            View Reports
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle="Enrolled active students"
          icon={Users}
          color="slate"
        />
        <StatCard
          title="Total Subjects"
          value={totalSubjects}
          subtitle="Active curriculum courses"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Today's Present"
          value={todayPresent}
          subtitle="Recorded present today"
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Today's Absent"
          value={todayAbsent}
          subtitle="Absentees today"
          icon={UserX}
          color="red"
        />
      </div>

      {/* Average Attendance Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-slate-900 text-white">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Institution-Wide Attendance Average</h3>
            <p className="text-xs text-slate-500">Computed across all recorded sessions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-extrabold text-slate-900">{averageAttendance}%</span>
          <Badge
            variant={
              averageAttendance >= 85 ? 'success' : averageAttendance >= 75 ? 'warning' : 'danger'
            }
          >
            {averageAttendance >= 85 ? 'Healthy' : averageAttendance >= 75 ? 'Moderate' : 'Critical'}
          </Badge>
        </div>
      </div>

      {/* 7-Day Trend & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Last 7 Days Attendance Trend</h3>
            <span className="text-xs text-slate-400">Daily average (%)</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
            {trend.map((day) => {
              const heightPct = Math.max(8, day.percentage);
              const colorCls = getAttendanceColorClasses(day.percentage);
              const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-semibold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.percentage}%
                  </span>
                  <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg h-32 flex items-end p-1">
                    <div
                      className={`w-full ${colorCls.bar} rounded-t-md transition-all duration-500`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">{dayLabel}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>&ge; 85%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>75 - 84%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>&lt; 75%</span>
            </div>
          </div>
        </div>

        {/* Quick Shortcut Cards */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/teacher/mark-attendance"
                className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Mark Today's Class</p>
                    <p className="text-[10px] text-slate-400">Record or edit attendance sheet</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/teacher/students"
                className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Manage Students</p>
                    <p className="text-[10px] text-slate-400">Add or edit student credentials</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/teacher/reports"
                className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Generate Reports</p>
                    <p className="text-[10px] text-slate-400">Download CSV / Defaulters list</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Automatic duplicate check enabled</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Recent Attendance Sessions</h3>
          <Link
            to="/teacher/history"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Subject</th>
                <th className="py-3 px-5">Class</th>
                <th className="py-3 px-5">Faculty</th>
                <th className="py-3 px-5">Present / Total</th>
                <th className="py-3 px-5">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No recent attendance recorded yet.
                  </td>
                </tr>
              ) : (
                recentActivity.map((item) => {
                  const colors = getAttendanceColorClasses(item.percentage);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-medium text-slate-900">{item.date}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-800">{item.subject}</span>
                        {item.subjectCode && (
                          <span className="ml-1.5 text-[10px] text-slate-400 font-mono">
                            ({item.subjectCode})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{item.classSection}</td>
                      <td className="py-3.5 px-5 text-slate-600">{item.teacher}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-slate-900">{item.presentCount}</span>
                        <span className="text-slate-400"> / {item.totalStudents}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${colors.badge}`}>
                          {item.percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
