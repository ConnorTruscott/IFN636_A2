import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const AdminPerformanceAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data
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

  if (loading) return <div className="p-6">Loading analytics…</div>;
  if (!analytics) return <div className="p-6 text-red-500">Failed to load analytics.</div>;

  const COLORS = ['#6b705c', '#a5a58d', '#cb997e', '#b5838d', '#6d6875'];


  // Category grouped data
  const categoryOrder = [
    "Academic Issues",
    "Campus Services",
    "Facilities & Maintenance",
    "Safety & Security",
    "Other"
  ];
  const categoryData = Object.entries(analytics.categoryBreakdown)
    .map(([category, values]) => ({ category, ...values }))
    .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));


  // Ratings distribution 
  const ratingData = Object.entries(analytics.ratingDistribution || {}).map(
    ([key, value]) => ({
      name: `${key} Star${key > 1 ? 's' : ''}`,
      value,
    })
  );

  // Warning color
  const getWarningClass = (level) => {
    if (level === "critical") return "bg-red-100 border-l-4 border-red-500 text-red-700";
    if (level === "warning") return "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700";
    return "bg-blue-100 border-l-4 border-blue-500 text-blue-700";
    };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">System Analytics</h1>
      <p className="text-gray-700 mb-6">Performance metrics and insights</p>
      
      {/* Warning */}
      {analytics.warnings && analytics.warnings.length > 0 && (
        <div className="mb-6">
          <p className="font-bold text-xl mb-2">Warnings</p>
          <div className="space-y-3">
            {analytics.warnings.map((w, i) => (
              <div
                key={i}
                className={`${getWarningClass(w.level)} p-3 rounded shadow`}
              >
                {w.message}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <SummaryCard title="Total Received" value={analytics.received} color="[#6b705c]" />
        <SummaryCard title="Total Resolving" value={analytics.resolving} color="[#cb997e]" />
        <SummaryCard title="Total Closed" value={analytics.closed} color="[#6d6875]" />
        <SummaryCard title="Overall Total" value={analytics.total} color="gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Complaints by Category*/}
        <div className="bg-white p-4 rounded shadow col-span-2">
          <h2 className="text-2xl font-bold mb-4">Complaints by Category</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend
                verticalAlign="top"
                align="center"
                content={() => (
                  <ul style={{ display: "flex", justifyContent: "center", listStyle: "none", padding: 0 }}>
                    <li style={{ margin: "0 10px", color: "#6b705c" }}>■ Received</li>
                    <li style={{ margin: "0 10px", color: "#cb997e" }}>■ Resolving</li>
                    <li style={{ margin: "0 10px", color: "#6d6875" }}>■ Closed</li>
                  </ul>
               )}
              />
              <Bar dataKey="received" fill="#6b705c" name="Received" />
              <Bar dataKey="resolving" fill="#cb997e" name="Resolving" />
              <Bar dataKey="closed" fill="#6d6875" name="Closed" />
            </BarChart>
          </ResponsiveContainer>
        </div>


      {/* Rating Distribution */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Rating Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={ratingData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {ratingData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center font-semibold">
            Average: {analytics.avgRating ? analytics.avgRating.toFixed(2) : 'No ratings yet'} / 5
          </p>
        </div>

      {/* Complaints Trend */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Complaints Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date"
                interval={4} 
                  tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#6b705c" strokeWidth={3} dot={{ r: 4 }} name="Total Complaints" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, color }) => (
  <div className={`bg-white p-4 rounded shadow text-center border-l-4 border-${color}`}>
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-4xl font-bold text-${color}`}>{value}</p>
  </div>
);

export default AdminPerformanceAnalytics;