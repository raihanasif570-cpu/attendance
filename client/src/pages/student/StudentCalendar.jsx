import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/students/me/calendar', {
          params: { month, year },
        });
        if (res.data.success) {
          setCalendarEvents(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, [month, year]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
    setSelectedDayEvents(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
    setSelectedDayEvents(null);
  };

  // Generate calendar grid days
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sunday

  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  // Group events by date
  const eventsByDate = {};
  calendarEvents.forEach((ev) => {
    if (!eventsByDate[ev.date]) {
      eventsByDate[ev.date] = [];
    }
    eventsByDate[ev.date].push(ev);
  });

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleDayClick = (day) => {
    if (!day) return;
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const evs = eventsByDate[dateStr] || [];
    setSelectedDateStr(dateStr);
    setSelectedDayEvents(evs);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Attendance Calendar</h1>
          <p className="text-xs text-slate-500">
            Day-by-day attendance history. Green indicates present classes, red indicates absences.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-xl px-2 py-1 shadow-xs">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-900 px-2 min-w-[120px] text-center">
            {monthName}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Day Cells */}
          {loading ? (
            <LoadingSpinner text="Loading month..." />
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="h-20 bg-slate-50/40 rounded-xl" />;
                }

                const formattedDay = String(day).padStart(2, '0');
                const formattedMonth = String(month).padStart(2, '0');
                const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
                const events = eventsByDate[dateKey] || [];

                const hasPresent = events.some((e) => e.status === 'Present' || e.status === 'Late');
                const hasAbsent = events.some((e) => e.status === 'Absent');
                const isSelected = selectedDateStr === dateKey;

                return (
                  <div
                    key={dateKey}
                    onClick={() => handleDayClick(day)}
                    className={`h-20 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                        : events.length > 0
                        ? 'border-slate-200 hover:border-slate-300 bg-white'
                        : 'border-slate-100 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800">{day}</span>

                    {events.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          {hasPresent && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Present" />
                          )}
                          {hasAbsent && (
                            <span className="w-2 h-2 rounded-full bg-rose-500" title="Absent" />
                          )}
                        </div>
                        <span className="block text-[9px] font-semibold text-slate-500 truncate">
                          {events.length} session{events.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Date Detail Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {selectedDateStr ? `Details for ${selectedDateStr}` : 'Day Inspection'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedDateStr
                ? 'Sessions recorded on this date'
                : 'Click any day on the calendar to view attended or missed subjects'}
            </p>

            {selectedDayEvents === null ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Click on any calendar day to inspect class attendance.
              </div>
            ) : selectedDayEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No classes recorded for this date.
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDayEvents.map((ev, i) => {
                  const isPres = ev.status === 'Present' || ev.status === 'Late';
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        isPres
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{ev.subject}</p>
                        <p className="text-[10px] opacity-75 font-mono">{ev.subjectCode}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          isPres ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                        }`}
                      >
                        {ev.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-around text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Present Class</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Absent Class</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCalendar;
