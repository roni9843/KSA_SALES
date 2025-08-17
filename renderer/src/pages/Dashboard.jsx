import { useEffect, useState } from 'react';
import { FaChartBar, FaShoppingCart, FaBoxOpen, FaUsers, FaMoneyBillWave, FaPlus, FaTruck, FaFileInvoiceDollar, FaFileInvoice, FaReceipt } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '../components/dashboard/StatCard';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, weeklySummary, recentInvoicesData, topProductsData] = await Promise.all([
          window.electron.getDashboardData(),
          window.electron.getWeeklySummary(),
          window.electron.getRecentInvoices(),
          window.electron.getTopSellingProducts(),
        ]);
        setData(dashboardData);
        setSalesData(weeklySummary);
        setRecentInvoices(recentInvoicesData);
        setTopSellingProducts(topProductsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div style={styles.centered}><p>Loading...</p></div>;
  }

  if (!data) {
    return <div style={styles.centered}><p>No data available.</p></div>;
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

      <div style={{...styles.statsGrid, marginTop: '24px'}}>
        <StatCard
          icon={<FaUsers size={24} color="white" />}
          title="Total Customers"
          value={data.totalCustomers}
          iconBgColor="#007bff"
        />
        <StatCard
          icon={<FaTruck size={24} color="white" />}
          title="Total Suppliers"
          value={data.totalSuppliers}
          iconBgColor="#6610f2"
        />
        <StatCard
          icon={<FaFileInvoiceDollar size={24} color="white" />}
          title="Total Due Invoices"
          value={data.totalDueInvoices}
          iconBgColor="#fd7e14"
        />
        <StatCard
          icon={<FaFileInvoice size={24} color="white" />}
          title="Today's Invoices"
          value={data.todaysTotalInvoices}
          iconBgColor="#20c997"
        />
        <StatCard
          icon={<FaReceipt size={24} color="white" />}
          title="Today's Purchases"
          value={data.todaysTotalPurchases}
          iconBgColor="#e83e8c"
        />
      </div>

      <div style={{...styles.mainGrid, marginTop: '24px'}}>
        <div style={styles.chartContainer}>
            <h2 style={styles.sectionTitle}>Weekly Sales & Purchases</h2>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none' }} />
                  <Legend />
                  <Bar dataKey="sales" fill="#28a745" name="Sales" />
                  <Bar dataKey="purchases" fill="#17a2b8" name="Purchases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>

        <div style={styles.rightColumn}>
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
          <div style={{...styles.recentInvoicesContainer, marginTop: '24px'}}>
            <h2 style={styles.sectionTitle}>Top Selling Products This Week</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {topSellingProducts.map((product, index) => (
                    <li key={index} style={{...styles.invoiceItem, borderBottom: index < topSellingProducts.length - 1 ? '1px solid #3E404E' : 'none'}}>
                        <p style={{ fontWeight: '600', margin: 0, color: '#fff' }}>{product.name}</p>
                        <p style={{ fontSize: '14px', color: '#a0aec0', margin: 0 }}>Sold: {product.total_quantity}</p>
                    </li>
                ))}
            </ul>
          </div>
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