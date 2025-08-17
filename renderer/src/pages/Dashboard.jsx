import { useEffect, useState } from 'react';
import { FaChartBar, FaShoppingCart, FaBoxOpen, FaUsers, FaMoneyBillWave, FaPlus } from 'react-icons/fa';
import StatCard from '../components/dashboard/StatCard';

// Mock data for charts - replace with actual data fetching
const salesData = [
  { name: 'Mon', sales: 4000, purchases: 2400 },
  { name: 'Tue', sales: 3000, purchases: 1398 },
  { name: 'Wed', sales: 2000, purchases: 9800 },
  { name: 'Thu', sales: 2780, purchases: 3908 },
  { name: 'Fri', sales: 1890, purchases: 4800 },
  { name: 'Sat', sales: 2390, purchases: 3800 },
  { name: 'Sun', sales: 3490, purchases: 4300 },
];

const recentInvoices = [
    { id: 'INV-001', customer: 'John Doe', amount: '$250.00', status: 'Paid' },
    { id: 'INV-002', customer: 'Jane Smith', amount: '$150.75', status: 'Pending' },
    { id: 'INV-003', customer: 'Sam Wilson', amount: '$45.00', status: 'Paid' },
    { id: 'INV-004', customer: 'Chris Lee', amount: '$300.50', status: 'Overdue' },
];

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
    return <div style={styles.centered}><p style={{color: '#000'}}>Loading...</p></div>;
  }

  if (!data) {
    return <div style={styles.centered}><p style={{color: '#000'}}>No data available.</p></div>;
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return { backgroundColor: '#28a745', color: '#fff' };
      case 'Pending': return { backgroundColor: '#ffc107', color: '#000' };
      case 'Overdue': return { backgroundColor: '#dc3545', color: '#fff' };
      default: return {};
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <button style={styles.button}>
            <FaPlus style={{ marginRight: '8px' }} /> Create Invoice
        </button>
      </div>
      
      <div style={styles.statsGrid}>
        <StatCard
          icon={<FaMoneyBillWave size={24} color="white" />}
          title="Today's Sale"
          value={`${data.todaysSale.toFixed(2)}`}
          iconBgColor="#28a745"
        />
        <StatCard
          icon={<FaShoppingCart size={24} color="white" />}
          title="Today's Purchase"
          value={`${data.todaysPurchase.toFixed(2)}`}
          iconBgColor="#17a2b8"
        />
        <StatCard
          icon={<FaBoxOpen size={24} color="white" />}
          title="Available Products"
          value={data.availableProducts}
          iconBgColor="#ffc107"
        />
        <StatCard
          icon={<FaUsers size={24} color="white" />}
          title="Total Customer Due"
          value={`${data.totalCustomerDue.toFixed(2)}`}
          iconBgColor="#dc3545"
        />
        <StatCard
          icon={<FaChartBar size={24} color="white" />}
          title="Today's Profit"
          value={`${data.todaysProfit.toFixed(2)}`}
          iconBgColor="#6f42c1"
        />
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.chartContainer}>
            <h2 style={styles.sectionTitle}>Weekly Sales & Purchases</h2>
            <div style={{...styles.centered, height: '320px', color: '#a0aec0'}}>
                <p>Chart component will be here. Need to install a charting library.</p>
            </div>
        </div>

        <div style={styles.recentInvoicesContainer}>
            <h2 style={styles.sectionTitle}>Recent Invoices</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {recentInvoices.map((invoice, index) => (
                    <li key={invoice.id} style={{...styles.invoiceItem, borderBottom: index < recentInvoices.length - 1 ? '1px solid #3E404E' : 'none'}}>
                        <div>
                            <p style={{ fontWeight: '600', margin: 0, color: '#fff' }}>{invoice.id} - {invoice.customer}</p>
                            <p style={{ fontSize: '14px', color: '#a0aec0', margin: 0 }}>{invoice.amount}</p>
                        </div>
                        <span style={{...styles.statusBadge, ...getStatusStyle(invoice.status)}}>
                            {invoice.status}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    color: '#ecf0f1',
    padding: '20px',
    background: '#343746', // Matching layout background
    borderRadius: '8px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
    color: '#fff',
  },
  button: {
    backgroundColor: '#6f42c1',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
  chartContainer: {
    backgroundColor: '#2E303E',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  recentInvoicesContainer: {
    backgroundColor: '#2E303E',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#fff',
    margin: 0,
  },
  invoiceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
  },
  statusBadge: {
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 'bold',
    borderRadius: '12px',
  },
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
};

// Media query for larger screens
if (window.matchMedia("(min-width: 1024px)").matches) {
  styles.mainGrid = {
    ...styles.mainGrid,
    gridTemplateColumns: '2fr 1fr',
  };
}

export default Dashboard;
