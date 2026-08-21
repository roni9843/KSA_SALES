import PropTypes from 'prop-types';

const StatCard = ({ icon, title, value, iconBgColor }) => (
  <div style={styles.card}>
    <div style={{ ...styles.iconContainer, backgroundColor: iconBgColor }}>
      {icon}
    </div>
    <div>
      <p style={styles.title}>{title}</p>
      <p style={styles.value}>{value}</p>
    </div>
  </div>
);

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s ease-in-out',
  },
  iconContainer: {
    padding: '12px',
    borderRadius: '12px',
    marginRight: '16px',
  },
  title: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    margin: 0,
  },
  value: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
};

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  iconBgColor: PropTypes.string.isRequired,
};

export default StatCard;
