// components/map_controls/FilterControls.tsx
import React, { useState } from 'react';
import CustomTimeSlider from './timeslider'; // Ensure the path is correct

const permaMinSound: number = 0;
const permaMaxSound: number = 1000;


interface FilterControlsProps {
  minSoundLevel: number;
  maxSoundLevel: number;
  windowSize: number;
  onFilterChange: (min: number, max: number) => void;
  windowChange: (duration: number) => void;
  minTimestamp: number; // normalized min (0)
  maxTimestamp: number; // normalized max (duration)
  selectedTimestamp: number; // normalized value
  onTimeChange: (timestamp: number) => void;

}

const FilterControls: React.FC<FilterControlsProps> = ({
  minSoundLevel,
  maxSoundLevel,
  windowSize,
  onFilterChange,
  windowChange,
  minTimestamp,
  maxTimestamp,
  selectedTimestamp,
  onTimeChange,
}) => {
  // Local state for managing the input fields
  const [localMinLevel, setLocalMinLevel] = useState<string | number>(minSoundLevel);
  const [localMaxLevel, setLocalMaxLevel] = useState<string | number>(maxSoundLevel);
  const [localTimeWindow, setLocalTimeWindow] = useState<string | number>(windowSize);

  const handleApplyFilter = () => {
    // Parse the input as numbers before applying the filter
    const min = typeof localMinLevel === 'string' ? parseFloat(localMinLevel) : localMinLevel;
    const max = typeof localMaxLevel === 'string' ? parseFloat(localMaxLevel) : localMaxLevel;
    if (!isNaN(min) && !isNaN(max)) {
      console.log(`FilterControls: Applying sound level filter: min=${min}, max=${max}`);
      onFilterChange(min, max);
    } else {
      alert('Please enter valid numeric values for the sound levels.');
    }
  };
  const handleApplyWindow = () => {
    const window = typeof localTimeWindow === 'string' ? parseFloat(localTimeWindow) : localTimeWindow;
    if (!isNaN(window)) {
      console.log(`FilterControls: Applying time window: widnow=${window}`);
      windowChange(window);
    } else {
      alert('Please enter valid numeric values for the time window.');
    }
  }

  const clearfilter = () => {
    // Reset local sound level inputs to default values
    setLocalMinLevel(permaMinSound);
    setLocalMaxLevel(permaMaxSound);

    // Notify parent component to reset filters
    onFilterChange(minSoundLevel, maxSoundLevel);

    console.log('FilterControls: Cleared all filters to default values.');
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
            onChange={(e) => {
              console.log(`FilterControls: Min Level changed to ${e.target.value}`);
              setLocalMinLevel(e.target.value);
            }}
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
            onChange={(e) => {
              console.log(`FilterControls: Max Level changed to ${e.target.value}`);
              setLocalMaxLevel(e.target.value);
            }}
            style={styles.input}
            placeholder="Max Level"
          />
        </label>
      </div>
      <div style={styles.buttonGroup}>
        <button onClick={handleApplyFilter} style={styles.button}>
          Apply Filter
        </button>
        <button onClick={clearfilter} style={{ ...styles.button, backgroundColor: '#6c757d' }}>
          Clear Filters
        </button>
      </div>

      <hr style={styles.divider} />

      <h3>Filter by Time</h3>
      <CustomTimeSlider
        minTimestamp={minTimestamp}
        maxTimestamp={maxTimestamp}
        selectedTimestamp={selectedTimestamp}
        onTimeChange={(value) => {
          console.log(`FilterControls: Time Slider changed to: ${value} (${new Date(value)})`);
          onTimeChange(value);
        }}
      />

      <div style={styles.inputGroup}>
        <label>
          Time Window:
          <input
            type="number"
            value={localTimeWindow}
            onChange={(e) => {
              setLocalTimeWindow(e.target.value);
            }}
            style={styles.input}
            placeholder="Max Level"
          />
        </label>
      </div>
      <button onClick={handleApplyWindow} style={styles.button}>
        Apply Window
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slight transparency
    padding: '15px',
    borderRadius: '8px',
    fontSize: '14px',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
    zIndex: 1000, // Ensure the filter controls are always on top
    maxWidth: '300px',
    width: '90%', // Responsive width
  },
  inputGroup: {
    marginBottom: '10px',
  },
  input: {
    marginLeft: '10px',
    padding: '5px',
    width: '60px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  button: {
    flex: 1,
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  divider: {
    margin: '15px 0',
    border: 'none',
    borderTop: '1px solid #ddd',
  },
};

export default FilterControls;
