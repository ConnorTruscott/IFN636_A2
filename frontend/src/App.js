import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Page and Component Imports
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Feedback from './pages/Feedback';
import StudentDashboard from './pages/StudentDashboard';

// Import the dashboards for roles
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminPerformanceAnalytics from './pages/AdminPerformanceAnalytics';
import AdminPage from './pages/Admin'; // 1. ADD THIS MISSING IMPORT

import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
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
        
        {/* Role-Specific Routing */}
        <Route 
          path="/complaints"
          element={
            role === 'admin' ? <AdminDashboard /> :
            role === 'staff' ? <StaffDashboard /> :
            <StudentDashboard />
          }
        />
        <Route 
          path="/staff-dashboard" 
          element={role === 'staff' ? <StaffDashboard /> : <Navigate to="/login" />} 
        />

        {/* --- Admin Routes --- */}
        <Route
          path="/admin-dashboard"
          element={role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/analytics"
          // 2. PROTECT THIS ROUTE
          element={role === 'admin' ? <AdminPerformanceAnalytics /> : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          // 3. FIX THE LOGIC AND REDIRECT
          element={role === 'admin' ? <AdminPage /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;