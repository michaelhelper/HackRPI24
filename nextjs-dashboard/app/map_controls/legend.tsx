import React from 'react';

const Legend: React.FC = () => {
  const legendItems = [
    { color: 'green', label: '< 40 dB' },
    { color: 'lightgreen', label: '40 - 50 dB' },
    { color: 'yellow', label: '50 - 60 dB' },
    { color: 'orange', label: '60 - 70 dB' },
    { color: 'darkorange', label: '70 - 80 dB' },
    { color: 'red', label: '80 - 90 dB' },
    { color: 'darkred', label: '> 90 dB' },
  ];

  return (
    <div style={styles.legend}>
      <h3 style={styles.legendTitle}>Sound Level Legend</h3>
      {legendItems.map((item) => (
        <div key={item.label} style={styles.legendItem}>
          <span
            style={{ ...styles.legendColor, backgroundColor: item.color }}
          ></span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const styles = {
  legend: {
    position: 'absolute' as 'absolute',
    bottom: '30px',
    left: '10px',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '12px',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
  },
  legendTitle: {
    margin: '0 0 5px 0',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px',
  },
  legendColor: {
    width: '15px',
    height: '15px',
    marginRight: '5px',
    border: '1px solid #ccc',
  },
};

export default Legend;
