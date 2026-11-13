import React, { useState, useEffect } from 'react';
import { Calculator, Target, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { calculateClassesForTarget, getAttendanceColorClasses } from '../../utils/attendanceUtils';

const AttendanceCalculatorPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custom Simulator State
  const [customTarget, setCustomTarget] = useState(75);
  const [selectedSubjectId, setSelectedSubjectId] = useState('overall'); // 'overall' or subjectId

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axiosClient.get('/students/me/attendance');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) return <LoadingSpinner text="Loading calculator..." />;

  const { overall, subjects = [] } = data || {};

  // Determine which pool of classes to calculate for (Overall or Specific Subject)
  let activePresent = overall?.presentClasses || 0;
  let activeTotal = overall?.totalClasses || 0;
  let activeName = 'Overall Semester Attendance';

  if (selectedSubjectId !== 'overall') {
    const sub = subjects.find((s) => s.subjectId === selectedSubjectId);
    if (sub) {
      activePresent = sub.present;
      activeTotal = sub.total;
      activeName = `${sub.subjectName} (${sub.subjectCode})`;
    }
  }

  const currentPct = activeTotal > 0 ? (activePresent / activeTotal) * 100 : 0;
  const currentColors = getAttendanceColorClasses(currentPct);

  // Calculate standard targets: 75%, 80%, 85%, 90%
  const targets = [75, 80, 85, 90].map((tgt) =>
    calculateClassesForTarget(activePresent, activeTotal, tgt)
  );

  // Custom target result
  const customResult = calculateClassesForTarget(activePresent, activeTotal, customTarget);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Attendance Target Calculator</h1>
        <p className="text-xs text-slate-500">
          Calculate the exact number of upcoming classes you need to attend or can safely miss to meet your targets
        </p>
      </div>

      {/* Scope Selector: Overall vs Subject */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-xs font-semibold text-slate-700">Calculate For:</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="overall">Overall All Subjects Combined</option>
          {subjects.map((s) => (
            <option key={s.subjectId} value={s.subjectId}>
              {s.subjectName} ({s.subjectCode})
            </option>
          ))}
        </select>
      </div>

      {/* Current Standing Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Current Scope
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">{activeName}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Attended <strong>{activePresent}</strong> out of <strong>{activeTotal}</strong> total
            conducted classes.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={`text-3xl font-black ${currentColors.text}`}>
              {currentPct.toFixed(1)}%
            </span>
            <span className={`block text-xs font-bold ${currentColors.text}`}>
              {currentColors.label}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Standard Milestone Target Cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-slate-900" />
          Standard College Targets (75%, 80%, 85%, 90%)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {targets.map((res) => {
            const isAchieved = res.achieved;

            return (
              <div
                key={res.target}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isAchieved ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900">Target {res.target}%</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAchieved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isAchieved ? 'Eligible' : 'Shortage'}
                    </span>
                  </div>

                  <div className="my-2">
                    {isAchieved ? (
                      <div>
                        <span className="text-2xl font-black text-emerald-600">{res.canMiss}</span>
                        <span className="text-xs font-semibold text-slate-600 ml-1.5">
                          classes can be missed
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-2xl font-black text-rose-600">{res.needed}</span>
                        <span className="text-xs font-semibold text-slate-600 ml-1.5">
                          consecutive classes needed
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 leading-relaxed">
                  {res.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Target Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-slate-900" />
          <h3 className="text-sm font-bold text-slate-900">Custom Target Goal Simulator</h3>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-slate-600">Slide to test custom target:</span>
            <span className="text-base font-bold text-slate-900">{customTarget}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="95"
            step="1"
            value={customTarget}
            onChange={(e) => setCustomTarget(Number(e.target.value))}
            className="w-full accent-slate-900 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>60% (Minimum pass)</span>
            <span>75% (Mandatory Exam Criteria)</span>
            <span>85% (Scholarship Tier)</span>
            <span>95% (Honors)</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border flex items-center gap-4 ${
            customResult.achieved
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {customResult.achieved ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          )}
          <div className="text-xs leading-relaxed">
            <p className="font-bold">
              Simulation for {customTarget}% in {activeName}:
            </p>
            <p>{customResult.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalculatorPage;
