import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import Complaints from './Complaints';

export default function AdminComplaintsSwitch() {
  const { user } = useAuth();
  const role =
    (user?.role || localStorage.getItem('role') || '').toLowerCase();

  // Only admin can sees the new Dashboard
  return role === 'admin' ? <AdminDashboard /> : <Complaints />;
}
