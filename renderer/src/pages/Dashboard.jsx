import { useEffect, useState } from 'react';
import { FaChartBar, FaShoppingCart, FaBoxOpen, FaUsers, FaMoneyBillWave, FaTruck, FaFileInvoiceDollar, FaFileInvoice, FaReceipt, FaSave } from 'react-icons/fa';
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
    return <div style={styles.centered}><p className="text-slate-600 font-medium">Loading Dashboard...</p></div>;
  }

  if (!data) {
    return <div style={styles.centered}><p className="text-slate-600 font-medium">No data available.</p></div>;
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' };
      case 'Pending': return { backgroundColor: '#fef9c3', color: '#a16207', border: '1px solid #fde047' };
      case 'Overdue': return { backgroundColor: '#ffe4e6', color: '#be123c', border: '1px solid #fca5a5' };
      default: return {};
    }
  };

  return (
    <div style={styles.dashboardContainer}>

      <div style={styles.statsGrid}>
        <StatCard
          icon={<FaMoneyBillWave size={22} color="white" />}
          title="Today's Sale"
          value={`${data.todaysSale.toFixed(2)}`}
          iconBgColor="#10b981"
        />
        <StatCard
          icon={<FaShoppingCart size={22} color="white" />}
          title="Today's Purchase"
          value={`${data.todaysPurchase.toFixed(2)}`}
          iconBgColor="#06b6d4"
        />
        <StatCard
          icon={<FaBoxOpen size={22} color="white" />}
          title="Available Products"
          value={data.availableProducts}
          iconBgColor="#f59e0b"
        />
        <StatCard
          icon={<FaUsers size={22} color="white" />}
          title="Total Customer Due"
          value={`${data.totalCustomerDue.toFixed(2)}`}
          iconBgColor="#ef4444"
        />
        <StatCard
          icon={<FaChartBar size={22} color="white" />}
          title="Today's Profit"
          value={`${data.todaysProfit.toFixed(2)}`}
          iconBgColor="#8b5cf6"
        />
      </div>

      <div style={{ ...styles.statsGrid, marginTop: '20px' }}>
        <StatCard
          icon={<FaUsers size={22} color="white" />}
          title="Total Customers"
          value={data.totalCustomers}
          iconBgColor="#2563eb"
        />
        <StatCard
          icon={<FaTruck size={22} color="white" />}
          title="Total Suppliers"
          value={data.totalSuppliers}
          iconBgColor="#6366f1"
        />
        <StatCard
          icon={<FaFileInvoiceDollar size={22} color="white" />}
          title="Total Due Invoices"
          value={data.totalDueInvoices}
          iconBgColor="#f97316"
        />
        <StatCard
          icon={<FaFileInvoice size={22} color="white" />}
          title="Today's Invoices"
          value={data.todaysTotalInvoices}
          iconBgColor="#14b8a6"
        />
        <StatCard
          icon={<FaReceipt size={22} color="white" />}
          title="Today's Purchases"
          value={data.todaysTotalPurchases}
          iconBgColor="#ec4899"
        />
        <StatCard
          icon={<FaSave size={22} color="white" />}
          title="Pending Draft Invoices"
          value={data.draftInvoiceCount || 0}
          iconBgColor="#eab308"
        />
      </div>

      <div style={{ ...styles.mainGrid, marginTop: '20px' }}>
        <div style={styles.chartContainer}>
          <h2 style={styles.sectionTitle}>Weekly Sales & Purchases</h2>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }} />
                <Legend />
                <Bar dataKey="sales" fill="#10b981" name="Sales" />
                <Bar dataKey="purchases" fill="#06b6d4" name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.recentInvoicesContainer}>
            <h2 style={styles.sectionTitle}>Recent Invoices</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentInvoices.map((invoice, index) => (
                <li key={invoice.id} style={{ ...styles.invoiceItem, borderBottom: index < recentInvoices.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div>
                    <p style={{ fontWeight: '700', margin: 0, color: '#0f172a', fontSize: '14px' }}>{invoice.id} - {invoice.customer}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{invoice.amount}</p>
                  </div>
                  <span style={{ ...styles.statusBadge, ...getStatusStyle(invoice.status) }}>
                    {invoice.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ ...styles.recentInvoicesContainer, marginTop: '20px' }}>
            <h2 style={styles.sectionTitle}>Top Selling Products This Week</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {topSellingProducts.map((product, index) => (
                <li key={index} style={{ ...styles.invoiceItem, borderBottom: index < topSellingProducts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <p style={{ fontWeight: '600', margin: 0, color: '#0f172a', fontSize: '14px' }}>{product.name}</p>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Sold: {product.total_quantity}</p>
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
    color: '#0f172a',
    padding: '4px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '20px',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  recentInvoicesContainer: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '800',
    marginBottom: '16px',
    color: '#0f172a',
    margin: 0,
  },
  invoiceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
  },
  statusBadge: {
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '700',
    borderRadius: '8px',
  },
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
};

if (window.matchMedia("(min-width: 1024px)").matches) {
  styles.mainGrid = {
    ...styles.mainGrid,
    gridTemplateColumns: '2fr 1fr',
  };
}

export default Dashboard;