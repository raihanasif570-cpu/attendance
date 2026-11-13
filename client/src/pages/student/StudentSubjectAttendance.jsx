import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, XCircle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProgressBar from '../../components/common/ProgressBar';
import { getAttendanceColorClasses, calculateClassesForTarget } from '../../utils/attendanceUtils';

const StudentSubjectAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubId, setExpandedSubId] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axiosClient.get('/students/me/attendance');
        if (res.data.success) {
          setSubjects(res.data.data.subjects || []);
          if (res.data.data.subjects?.length > 0) {
            setExpandedSubId(res.data.data.subjects[0].subjectId);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) return <LoadingSpinner text="Loading subject breakdown..." />;

  const toggleExpand = (id) => {
    setExpandedSubId(expandedSubId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Subject-Wise Attendance Details</h1>
        <p className="text-xs text-slate-500">
          In-depth attendance breakdown, target projections, and complete session history for each course
        </p>
      </div>

      <div className="space-y-4">
        {subjects.map((sub) => {
          const colors = getAttendanceColorClasses(sub.percentage);
          const isExpanded = expandedSubId === sub.subjectId;
          const target75 = calculateClassesForTarget(sub.present, sub.total, 75);
          const target85 = calculateClassesForTarget(sub.present, sub.total, 85);

          return (
            <div
              key={sub.subjectId}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
            >
              {/* Card Header / Summary */}
              <div
                onClick={() => toggleExpand(sub.subjectId)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} shrink-0`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {sub.subjectCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{sub.subjectName}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Attended <strong>{sub.present}</strong> of <strong>{sub.total}</strong> classes
                      &bull; Missed <strong>{sub.absent}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-36 hidden sm:block">
                    <ProgressBar percentage={sub.percentage} showLabel={false} size="sm" />
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-extrabold ${colors.text}`}>{sub.percentage}%</span>
                    <span className="block text-[10px] text-slate-400 font-medium">
                      {colors.label.split(' ')[0]}
                    </span>
                  </div>
                  <button className="text-slate-400 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded History & Target Section */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4 animate-in fade-in duration-200">
                  {/* Targets for this subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-slate-200/80 rounded-xl text-xs">
                      <span className="font-bold text-slate-900 block mb-1">Minimum 75% Requirement:</span>
                      <span className="text-slate-600">{target75.message}</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-200/80 rounded-xl text-xs">
                      <span className="font-bold text-slate-900 block mb-1">Excellent 85% Target:</span>
                      <span className="text-slate-600">{target85.message}</span>
                    </div>
                  </div>

                  {/* Complete Log List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Session History Log ({sub.history?.length || 0})
                    </h4>

                    {sub.history?.length === 0 ? (
                      <p className="text-xs text-slate-400">No session logs for this course.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {sub.history.map((h, idx) => {
                          const isPres = h.status === 'Present' || h.status === 'Late';
                          return (
                            <div
                              key={idx}
                              className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                                isPres
                                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                                  : 'bg-rose-50/60 border-rose-200 text-rose-800'
                              }`}
                            >
                              <span className="font-medium text-[11px]">{h.date}</span>
                              <span className="font-bold text-[10px] uppercase">{h.status}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentSubjectAttendance;
