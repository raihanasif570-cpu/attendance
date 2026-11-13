import React, { useState } from 'react';
import { Menu, Bell, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationModal from './NotificationModal';

const Navbar = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block sm:inline mr-2">
              {user?.department?.name || 'College Attendance'}
            </span>
            {user?.classSection && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                {user.classSection.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{todayStr}</span>
          </div>

          <button
            onClick={() => setShowNotifications(true)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            title="Announcements & Alerts"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>
        </div>
      </header>

      <NotificationModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
};

export default Navbar;
