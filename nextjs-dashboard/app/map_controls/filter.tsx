// components/FilterControls.tsx
import React, { useState } from 'react';
import Legend from './legend'; // Adjust the path as necessary


interface FilterControlsProps {
  minSoundLevel: number;
  maxSoundLevel: number;
  onFilterChange: (min: number, max: number) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  minSoundLevel,
  maxSoundLevel,
  onFilterChange,
}) => {
  // Local state for managing the input fields
  const [localMinLevel, setLocalMinLevel] = useState<string | number>(minSoundLevel);
  const [localMaxLevel, setLocalMaxLevel] = useState<string | number>(maxSoundLevel);

  const handleApplyFilter = () => {
    // Parse the input as numbers before applying the filter
    const min = typeof localMinLevel === 'string' ? parseFloat(localMinLevel) : localMinLevel;
    const max = typeof localMaxLevel === 'string' ? parseFloat(localMaxLevel) : localMaxLevel;
    if (!isNaN(min) && !isNaN(max)) {
      onFilterChange(min, max);
    } else {
      alert('Please enter valid numeric values for the sound levels.');
    }
  };

  return (
    <div style={styles.filterContainer}>
      <h3>Filter Sound Levels</h3>
      <div style={styles.inputGroup}>
        <label>
          Min Level:
          <input
            type="number"
            value={localMinLevel}
            onChange={(e) => setLocalMinLevel(e.target.value)}
            style={styles.input}
            placeholder="Min Level"
          />
        </label>
      </div>
      <div style={styles.inputGroup}>
        <label>
          Max Level:
          <input
            type="number"
            value={localMaxLevel}
            onChange={(e) => setLocalMaxLevel(e.target.value)}
            style={styles.input}
            placeholder="Max Level"
          />
        </label>
      </div>
      <button onClick={handleApplyFilter} style={styles.button}>
        Apply Filter
      </button>
      
    </div>
  );
};

// Inline styles for the filter controls
const styles = {
  filterContainer: {
    position: 'absolute' as 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
  },
  inputGroup: {
    marginBottom: '10px',
  },
  input: {
    marginLeft: '10px',
    padding: '5px',
    width: '60px',
  },
  button: {
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default FilterControls;
