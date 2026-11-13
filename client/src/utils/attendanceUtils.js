/**
 * Attendance Color Standards:
 * Green: 85% and above
 * Yellow: 75–84%
 * Red: Below 75%
 */

export const getAttendanceTier = (percentage) => {
  const pct = Number(percentage) || 0;
  if (pct >= 85) return 'green';
  if (pct >= 75) return 'yellow';
  return 'red';
};

export const getAttendanceColorClasses = (percentage) => {
  const tier = getAttendanceTier(percentage);
  switch (tier) {
    case 'green':
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        bar: 'bg-emerald-500',
        badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        ring: 'ring-emerald-500',
        label: 'Excellent (≥ 85%)',
      };
    case 'yellow':
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        bar: 'bg-amber-500',
        badge: 'bg-amber-50 text-amber-700 border border-amber-200',
        ring: 'ring-amber-500',
        label: 'Satisfactory (75-84%)',
      };
    case 'red':
    default:
      return {
        text: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        bar: 'bg-rose-500',
        badge: 'bg-rose-50 text-rose-700 border border-rose-200',
        ring: 'ring-rose-500',
        label: 'Shortage (< 75%)',
      };
  }
};

/**
 * Calculates required classes to reach target percentage or how many classes can be safely missed.
 */
export const calculateClassesForTarget = (present, total, target) => {
  const p = Number(present) || 0;
  const t = Number(total) || 0;
  const tgt = Number(target) || 75;

  if (t === 0) {
    return { target: tgt, needed: 0, canMiss: 0, status: 'No classes held yet' };
  }

  const currentPct = (p / t) * 100;

  if (currentPct >= tgt) {
    const canMiss = Math.max(0, Math.floor((100 * p - tgt * t) / tgt));
    return {
      target: tgt,
      currentPct: Math.round(currentPct * 10) / 10,
      achieved: true,
      needed: 0,
      canMiss,
      message: `You can miss ${canMiss} class${canMiss === 1 ? '' : 'es'} without dropping below ${tgt}%.`,
    };
  } else {
    const needed = Math.ceil((tgt * t - 100 * p) / (100 - tgt));
    return {
      target: tgt,
      currentPct: Math.round(currentPct * 10) / 10,
      achieved: false,
      needed: Math.max(1, needed),
      canMiss: 0,
      message: `You need to attend next ${needed} consecutive class${needed === 1 ? '' : 'es'} to reach ${tgt}%.`,
    };
  }
};
