/**
 * Status Badge Component
 * Displays colored badge for order/payment/user status
 */
const statusStyles = {
  // Order status
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',

  // Payment status
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',

  // User/general status
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-700',
  approved: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
};

const StatusBadge = ({ status, label }) => {
  const display = label || status;
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {display}
    </span>
  );
};

export default StatusBadge;
