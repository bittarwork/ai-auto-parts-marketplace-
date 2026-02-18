import { Navigate } from 'react-router-dom';

/**
 * AdminRoute Guard
 * Allows access only to users with administrator role
 */
const AdminRoute = ({ children }) => {
  // Read auth state from localStorage (same pattern as the rest of the app)
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role !== 'administrator') {
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
