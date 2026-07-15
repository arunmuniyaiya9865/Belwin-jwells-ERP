import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    return <Navigate to="/admin/login" />;
  }

  if (role && user.role !== role) {
    // If they are logged in but wrong role, send them to their own dashboard
    const dashMap = { admin: '/admin-dashboard', hr: '/hr-dashboard', employee: '/employee-dashboard' };
    return <Navigate to={dashMap[user.role] || '/login'} />;
  }

  return children;
};

export default ProtectedRoute;
