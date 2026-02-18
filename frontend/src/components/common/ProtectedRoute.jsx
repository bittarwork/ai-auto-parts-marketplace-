import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute - wraps private routes
 * Redirects unauthenticated users to /login with the intended path saved in state
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
