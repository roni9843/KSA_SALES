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
    backgroundColor: '#2E303E',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease-in-out',
  },
  iconContainer: {
    padding: '12px',
    borderRadius: '50%',
    marginRight: '16px',
  },
  title: {
    fontSize: '14px',
    color: '#a0aec0',
    margin: 0,
  },
  value: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
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
