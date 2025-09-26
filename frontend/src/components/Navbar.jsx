import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notification from './Notification';
import { useEffect, useState } from "react";
import axios from "axios";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navbar menu
  useEffect(() => {
    if (user?.role) {
      axios
        .get(`/api/navbar?role=${user.role.toLowerCase()}`)
        .then((res) => {
          setMenu(res.data.menu);
        })
        .catch((err) => {
          console.error("Error fetching navbar:", err);
        });
    }
  }, [user]);


  //Placeholder for testing purposes, delete later
  const notifications = [
    {message: "New complaint submitted", read: false},
    {message: "Feedback received", read: false},
    {message: "System update completed", read: true}
  ];

const pathMap = {
  Complaint: "/complaints",
  Feedback: "/feedback",
  Profile: "/profile",
  Dashboard: "/dashboard",
  Analytics: "/admin/analytics"
};

  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center">
      {/* Project Name */}
      <Link to="/" className="text-2xl font-bold">Campus Complaint System</Link>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {menu.map((item, index) => {
              
              if (item === "Notifications") {
                return (
                  <Notification key={index} notifications={notifications} />
                );
              }
              if (item === "Logout") {
                return (
                  <button
                    key={index}
                    onClick={handleLogout}
                    className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
                  >
                    Logout
                  </button>
                );
              }

              const path = pathMap[item] || `/${item.toLowerCase()}`;
              return (
                <Link key={index} to={path} className="mr-4">
                  {item}
                </Link>
              );
            })}
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
