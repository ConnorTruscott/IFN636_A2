import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import Complaints from './Complaints';

export default function AdminComplaintsSwitch() {
  const { user } = useAuth();
  const role =
    (user?.role || localStorage.getItem('role') || '').toLowerCase();

  // Admin sees the new Dashboard; everyone else sees the existing Complaints page
  return role === 'admin' ? <AdminDashboard /> : <Complaints />;
}
