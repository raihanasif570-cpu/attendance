import React from 'react';
import { getAttendanceColorClasses } from '../../utils/attendanceUtils';

const ProgressBar = ({ percentage, showLabel = true, size = 'md' }) => {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));
  const colors = getAttendanceColorClasses(pct);

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium mb-1">
          <span className="text-slate-500">Attendance</span>
          <span className={`font-semibold ${colors.text}`}>{pct.toFixed(1)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${colors.bar} ${heightClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
