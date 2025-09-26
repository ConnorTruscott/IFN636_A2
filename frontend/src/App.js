import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import AdminPage from './pages/Admin';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Complaints from './pages/Complaints';
import Feedback from './pages/Feedback';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaintsSwitch from './pages/AdminComplaintsSwitch';
import {useAuth} from './context/AuthContext';

function App() {
  const {user} = useAuth();
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';
  const role = (user?.role || '').toLowerCase();

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/complaints"
          element={role === 'admin' ? <AdminComplaintsSwitch /> : <Complaints />}
        />
        <Route path="/feedback" element={<Feedback />} />
        <Route
          path="/dashboard"
          element={role === "admin" ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route path="/admin" element={user?.role === 'Admin' ? <AdminPage /> : <Navigate to='/home' />} />
      </Routes>
    </Router>
  );
}

export default App;
