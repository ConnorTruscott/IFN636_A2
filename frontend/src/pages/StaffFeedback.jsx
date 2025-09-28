import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const StaffFeedback = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null); 

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axiosInstance.get('/api/feedback', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFeedbacks(res.data || []);
        console.log("Fetched feedbacks:", res.data);
      } catch {
        alert('Failed to load student feedback.');
      }
    };
    if (user && user.token) {  
      fetchFeedbacks();
    }
  }, [user]);

  return (
    <div className="p-6">
      <div className="bg-white p-6 shadow-md rounded mb-6">
        <h2 className="text-xl font-bold mb-2">Student Feedback</h2>
        <p className="text-sm text-gray-500 mb-4">
          Review feedback from students on resolved complaints
        </p>

        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <p className="text-gray-500">No feedback available.</p>
          ) : (
            feedbacks.map((fb) => (
              <div 
                key={fb._id} 
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedFeedback(fb)} 
              >
                <div className="flex justify-between">
                  <div>
                  <h3 className="font-semibold text-lg">{fb.complaintTitle}</h3>
                  <p className="text-sm text-gray-500">By: {fb.studentName || "Unknown Student"}</p>
                  </div>
                  <div className="text-indigo-600 font-bold">Rating: {fb.rating}</div>
                </div>
                <p className="text-gray-700 mt-2 line-clamp-2">{fb.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for detail */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg w-1/2 p-6 relative">
            <button 
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setSelectedFeedback(null)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedFeedback.complaintTitle}</h2>
            <p className="text-sm text-gray-500 mb-2">By: {selectedFeedback.studentName || "Unknown Student"}</p>
            <p className="mb-4">{selectedFeedback.text}</p>
            <p className="text-indigo-600 font-semibold">Rating: {selectedFeedback.rating}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffFeedback;