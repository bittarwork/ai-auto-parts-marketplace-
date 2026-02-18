/**
 * Status Badge Component
 * Dot + label pill style for order / payment / user status
 */

const config = {
  // Order status
  pending:    { dot: 'bg-amber-400',   text: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200/60' },
  confirmed:  { dot: 'bg-blue-500',    text: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200/60' },
  processing: { dot: 'bg-indigo-500',  text: 'text-indigo-700', bg: 'bg-indigo-50',  border: 'border-indigo-200/60' },
  shipped:    { dot: 'bg-violet-500',  text: 'text-violet-700', bg: 'bg-violet-50',  border: 'border-violet-200/60' },
  delivered:  { dot: 'bg-emerald-500', text: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200/60' },
  cancelled:  { dot: 'bg-red-400',     text: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200/60' },

  // Payment status
  paid:       { dot: 'bg-emerald-500', text: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200/60' },
  failed:     { dot: 'bg-red-400',     text: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200/60' },
  refunded:   { dot: 'bg-orange-400',  text: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-200/60' },

  // User / general
  active:     { dot: 'bg-emerald-500', text: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200/60' },
  inactive:   { dot: 'bg-gray-400',    text: 'text-gray-600',   bg: 'bg-gray-100',   border: 'border-gray-200/60' },
  approved:   { dot: 'bg-emerald-500', text: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200/60' },
  suspended:  { dot: 'bg-red-400',     text: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200/60' },
};

const fallback = { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200/60' };

const StatusBadge = ({ status, label }) => {
  const c = config[status] || fallback;
  const display = label || status || '—';

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium capitalize
      border ${c.bg} ${c.text} ${c.border}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {display}
    </span>
  );
};

export default StatusBadge;
