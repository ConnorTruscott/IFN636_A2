import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Page and Component Imports
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Complaints from './pages/Complaints';
import Feedback from './pages/Feedback';

// Import the dashboards for roles
import AdminDashboard from './pages/AdminDashboard';

import AdminComplaintsSwitch from './pages/AdminComplaintsSwitch';
import AdminPerformanceAnalytics from './pages/AdminPerformanceAnalytics';
import StaffDashboard from './pages/StaffDashboard';
import { useAuth } from './context/AuthContext';


function App() {
  const { user } = useAuth();
  // Using a single, normalized role variable is cleaner
  const role = (user?.role || '').toLowerCase();

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (require login) */}
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/feedback" element={user ? <Feedback /> : <Navigate to="/login" />} />
        
        {/* Role-Specific Routing for a central "complaints" path */}
        <Route 
          path="/complaints"
          element={
            role === 'admin' ? <AdminDashboard /> : // Admins go to their dashboard
            role === 'staff' ? <StaffDashboard /> : // Staff go to their dashboard
            <Complaints /> // Students see the standard complaint form/list
          }
        />

        {/* Dedicated route for the staff dashboard */}
        <Route 
          path="/staff-dashboard" 
          element={role === 'staff' ? <StaffDashboard /> : <Navigate to="/login" />} 
        />

        {/* Dedicated route for the admin dashboard */}
        <Route
          path="/admin-dashboard"
          element={role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        />

        <Route
          path="/admin/analytics"
          element={<AdminPerformanceAnalytics />}
        />
        <Route
          path="/admin"
          element={user?.role === 'Admin' ? <AdminPage /> : <Navigate to="/home" />}
        />
      </Routes>
    </Router>
  );
}

export default App;