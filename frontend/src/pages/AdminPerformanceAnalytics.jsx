import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const AdminPerformanceAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axiosInstance.get('/api/analytics', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setAnalytics(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div className="p-6">Loading analytics…</div>;
  }

  if (!analytics) {
    return <div className="p-6 text-red-500">Failed to load analytics.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">System Analytics</h1>
      <p className="text-gray-700 mb-6">Performance metrics and insights</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Total Complaints</p>
          <p>{analytics.total}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Pending</p>
          <p>{analytics.pending}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Resolving</p>
          <p>{analytics.resolving}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Closed</p>
          <p>{analytics.closed}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Average Rating</p>
          <p>
            {analytics.avgRating
              ? analytics.avgRating.toFixed(2)
              : 'No ratings yet'}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
            <p className="font-semibold">Average Resolution Time (hours)</p>
            <p>
            {analytics.avgResolutionTime > 0
            ? (analytics.avgResolutionTime < 1
                ? "< 1 hour"
                : analytics.avgResolutionTime < 24
                    ? `${analytics.avgResolutionTime.toFixed(2)} hours`
                    : `${(analytics.avgResolutionTime / 24).toFixed(2)} days`)
            : "N/A"}
        </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPerformanceAnalytics;