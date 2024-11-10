import React, { useState, useEffect } from 'react';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

interface TimeSliderProps {
  minTimestamp: number;
  maxTimestamp: number;
  selectedTimestamp: number;
  onTimeChange: (timestamp: number) => void;
}

const ValueLabelComponent = (props: { children: React.ReactElement; value: number }) => {
  const { children, value } = props;

  // Format timestamp to readable time (e.g., HH:MM)
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Tooltip enterTouchDelay={0} placement="top" title={formatTime(value)}>
      {children}
    </Tooltip>
  );
};

const TimeSlider: React.FC<TimeSliderProps> = ({
  minTimestamp,
  maxTimestamp,
  selectedTimestamp,
  onTimeChange,
}) => {
  const [currentValue, setCurrentValue] = useState<number>(selectedTimestamp);

  useEffect(() => {
    setCurrentValue(selectedTimestamp);
  }, [selectedTimestamp]);

  const handleChange = (_event: Event, value: number | number[]) => {
    if (typeof value === 'number') {
      setCurrentValue(value);
      onTimeChange(value); // Callback to notify parent component
    }
  };

  return (
    <Box sx={{ padding: '20px', width: '80%', margin: '0 auto' }}>
      <h3>Select Time:</h3>
      <Slider
        min={minTimestamp}
        max={maxTimestamp}
        value={currentValue}
        onChange={handleChange}
        valueLabelDisplay="auto"
        components={{
          ValueLabel: ValueLabelComponent,
        }}
      />
    <div style={{ textAlign: 'center', marginTop: '10px' }}>
            {new Intl.DateTimeFormat('en-US', {
              timeZone: 'America/New_York',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true, // Use 12-hour format
            }).format(new Date(currentValue))}
          </div>
    </Box>
  );
};

export default TimeSlider;
