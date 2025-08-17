import { useEffect, useState } from 'react';
import { FaChartBar, FaShoppingCart, FaBoxOpen, FaUsers, FaMoneyBillWave } from 'react-icons/fa';

const StatCard = ({ icon, title, value }) => (
  <div className="p-4 rounded-lg shadow-md flex items-center bg-gray-800" >
    <div className="p-3 rounded-full mr-4 bg-gray-700">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await window.electron.getDashboardData();
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!data) {
    return <p>No data available.</p>;
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          icon={<FaMoneyBillWave size={24} color="white" />}
          title="Today's Sale"
          value={`${data.todaysSale.toFixed(2)}`}
        />
        <StatCard
          icon={<FaShoppingCart size={24} color="white" />}
          title="Today's Purchase"
          value={`${data.todaysPurchase.toFixed(2)}`}
        />
        <StatCard
          icon={<FaBoxOpen size={24} color="white" />}
          title="Available Products"
          value={data.availableProducts}
        />
        <StatCard
          icon={<FaUsers size={24} color="white" />}
          title="Total Customer Due"
          value={`${data.totalCustomerDue.toFixed(2)}`}
        />
        <StatCard
          icon={<FaChartBar size={24} color="white" />}
          title="Today's Profit"
          value={`${data.todaysProfit.toFixed(2)}`}
        />
      </div>
    </div>
  );
};

export default Dashboard;