import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintList from '../components/ComplaintList';
import { useAuth } from '../context/AuthContext';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [editingComplaint, setEditingComplaint] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axiosInstance.get('/api/complaints', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setComplaints(response.data);
      } catch (error) {
        alert('Failed to fetch complaints.');
      }
    };

    fetchComplaints();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <ComplaintForm
        complaints={complaints}
        setComplaints={setComplaints}
        editingComplaint={editingComplaint}
        setEditingComplaint={setEditingComplaint}
      />
      <ComplaintList complaints={complaints} setComplaints={setComplaints} setEditingComplaint={setEditingComplaint} />
    </div>
  );
};

export default Complaints;
