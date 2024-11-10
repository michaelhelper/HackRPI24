import React, { useState } from 'react';
import FilterControls from './map_controls/filter'; // Adjust the path as necessary
import Legend from './map_controls/legend'; // Adjust the path if it's in a different folder
import MapComponent from './map'; // Hypothetical component to display your map

const MapPage: React.FC = () => {
  // Initial values for sound levels
  const [minSoundLevel, setMinSoundLevel] = useState<number>(0);
  const [maxSoundLevel, setMaxSoundLevel] = useState<number>(100);
  
  // Initial values for timestamps
  const [minTimestamp] = useState<number>(new Date().setHours(0, 0, 0, 0)); // Midnight today
  const [maxTimestamp] = useState<number>(new Date().setHours(23, 59, 59, 999)); // End of today
  const [selectedTimestamp, setSelectedTimestamp] = useState<number>(new Date().getTime());

  // Handle changes from FilterControls
  const handleFilterChange = (min: number, max: number) => {
    setMinSoundLevel(min);
    setMaxSoundLevel(max);
    // You can add more code here to update the map or fetch new data based on the filter
  };

  // Handle changes from TimeSlider
  const handleTimeChange = (timestamp: number) => {
    setSelectedTimestamp(timestamp);
    // You can add more code here to update the map or fetch new data based on the timestamp
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      {/* Filter Controls Component */}
      <FilterControls
        minSoundLevel={minSoundLevel}
        maxSoundLevel={maxSoundLevel}
        onFilterChange={handleFilterChange}
        minTimestamp={minTimestamp}
        maxTimestamp={maxTimestamp}
        selectedTimestamp={selectedTimestamp}
        onTimeChange={handleTimeChange}
      />

      {/* Hypothetical Map Component */}
      <MapComponent
        minSoundLevel={minSoundLevel}
        maxSoundLevel={maxSoundLevel}
        selectedTimestamp={selectedTimestamp}
        // Any other props that your MapComponent needs
      />

      {/* Legend Component */}
      <Legend />

    </div>
  );
};

export default MapPage;
