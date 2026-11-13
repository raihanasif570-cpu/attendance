import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  History,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Calendar,
  Calculator,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const teacherLinks = [
    { name: 'Dashboard', to: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Mark Attendance', to: '/teacher/mark-attendance', icon: CheckSquare },
    { name: 'Attendance History', to: '/teacher/history', icon: History },
    { name: 'Manage Students', to: '/teacher/students', icon: Users },
    { name: 'Manage Subjects', to: '/teacher/subjects', icon: BookOpen },
    { name: 'Academic & Classes', to: '/teacher/academic', icon: GraduationCap },
    { name: 'Reports & Export', to: '/teacher/reports', icon: BarChart3 },
    ...(user?.role === 'admin'
      ? [{ name: 'Faculty Accounts', to: '/teacher/faculty', icon: GraduationCap }]
      : []),
  ];

  const studentLinks = [
    { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Subject Breakdown', to: '/student/subjects', icon: BookOpen },
    { name: 'Monthly Calendar', to: '/student/calendar', icon: Calendar },
    { name: 'Target Calculator', to: '/student/calculator', icon: Calculator },
  ];

  const navLinks = isTeacher ? teacherLinks : studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              CA
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900">CampusAttend</h1>
              <p className="text-[10px] font-medium text-slate-400 capitalize">{user?.role} Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Account
          </div>
          <NavLink
            to="/profile"
            onClick={() => onClose()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`
            }
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Profile & Security</span>
          </NavLink>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
