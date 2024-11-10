// components/map_controls/MapComponent.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import FilterControls from './map_controls/filter'; // Adjust the path as necessary

const TIME_RANGE = 15 * 60 * 1000; // 15 minutes in milliseconds

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

interface MyDocument {
  _id: string;
  device_id: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  sound_level: number;
}

interface MapProps {
  data: MyDocument[];
}

const MapComponent: React.FC<MapProps> = ({ data }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Extract timestamps from data
  const timestamps = data.map(item => new Date(item.timestamp).getTime());
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const duration = maxTimestamp - minTimestamp;

  // Extract sound levels
  const soundLevels = data.map(item => item.sound_level);
  const minSoundLevel = Math.min(...soundLevels);
  const maxSoundLevel = Math.max(...soundLevels);

  // State to manage the selected timestamp
  const [selectedTimestamp, setSelectedTimestamp] = useState<number>(maxTimestamp);

  // State to manage sound level filters
  const [filterMinSound, setFilterMinSound] = useState<number>(minSoundLevel);
  const [filterMaxSound, setFilterMaxSound] = useState<number>(maxSoundLevel);


  // Function to handle sound level filter changes
  const handleFilterChange = (min: number, max: number) => {
    console.log(`MapComponent: Applying sound level filter: min=${min}, max=${max}`);
    setFilterMinSound(min);
    setFilterMaxSound(max);
  };

  // Normalize the selected timestamp for the slider
  const sliderValue = selectedTimestamp - minTimestamp;

  // Function to handle time change from the slider
  const handleTimeChange = (value: number) => {
    const newTimestamp = minTimestamp + value;
    console.log(`MapComponent: Slider moved to: ${newTimestamp} (${new Date(newTimestamp).toLocaleString()})`);
    setSelectedTimestamp(newTimestamp);
  };

  // Filter data based on the selected timestamp and sound levels
  const filteredData = data.filter(item => {
    const itemTimestamp = new Date(item.timestamp).getTime();
    return (
        Math.abs(itemTimestamp - selectedTimestamp) <= TIME_RANGE &&

      item.sound_level >= filterMinSound &&
      item.sound_level <= filterMaxSound
    );
  });

  // Log filtered data
  useEffect(() => {
    console.log(`MapComponent: Selected Timestamp: ${selectedTimestamp} (${new Date(selectedTimestamp).toLocaleString()})`);
    console.log(`MapComponent: Sound Level Filter: ${filterMinSound} - ${filterMaxSound}`);
    console.log(`MapComponent: Filtered Data Count: ${filteredData.length}`);
    // Optionally, log the filtered data
    // console.log('MapComponent: Filtered Data:', filteredData);
  }, [selectedTimestamp, filterMinSound, filterMaxSound, filteredData]);

  // Initialize the map only once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/navigation-day-v1',
      center: [0, 0],
      zoom: 2,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;

    // Cleanup on unmount
    return () => map.remove();
  }, []);

  // Update markers whenever filteredData changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();

    // Use the built-in Map class without conflicts
    const coordinateCounts = new Map<string, number>();

    // First, count the number of markers at each coordinate
    filteredData.forEach((item) => {
      const lat = Number(item.location.latitude);
      const lng = Number(item.location.longitude);

      if (
        isNaN(lat) ||
        isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        console.warn(`MapComponent: Invalid coordinates for item with _id ${item._id}`);
        return;
      }

      const coordKey = `${lat},${lng}`;
      const count = coordinateCounts.get(coordKey) || 0;
      coordinateCounts.set(coordKey, count + 1);
    });

    // Now, keep track of the number of markers placed at each coordinate so far
    const coordinateCurrentCounts = new Map<string, number>();

    filteredData.forEach((item) => {
      const lat = Number(item.location.latitude);
      const lng = Number(item.location.longitude);

      if (
        isNaN(lat) ||
        isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        console.warn(`MapComponent: Invalid coordinates for item with _id ${item._id}`);
        return;
      }

      const coordKey = `${lat},${lng}`;
      const totalMarkersAtCoord = coordinateCounts.get(coordKey) || 1;
      const placedMarkersAtCoord = coordinateCurrentCounts.get(coordKey) || 0;

      // Calculate an offset for markers at the same coordinate
      let offsetLng = 0;
      let offsetLat = 0;
      if (totalMarkersAtCoord > 1) {
        const offsetStep = 0.001; // Adjust as needed
        const angle =
          (2 * Math.PI * placedMarkersAtCoord) / totalMarkersAtCoord;
        offsetLng = offsetStep * Math.cos(angle);
        offsetLat = offsetStep * Math.sin(angle);
      }

      coordinateCurrentCounts.set(coordKey, placedMarkersAtCoord + 1);

      const adjustedLng = lng + offsetLng;
      const adjustedLat = lat + offsetLat;

      bounds.extend([adjustedLng, adjustedLat]);

      let color = 'green'; // Default color for very low sound levels
      if (item.sound_level >= 40 && item.sound_level < 50) {
        color = 'lightgreen';
      } else if (item.sound_level >= 50 && item.sound_level < 60) {
        color = 'yellow';
      } else if (item.sound_level >= 60 && item.sound_level < 70) {
        color = 'orange';
      } else if (item.sound_level >= 70 && item.sound_level < 80) {
        color = 'darkorange';
      } else if (item.sound_level >= 80 && item.sound_level < 90) {
        color = 'red';
      } else if (item.sound_level >= 90) {
        color = 'darkred';
      }

      const el = document.createElement('div');
      el.style.backgroundColor = color;
      el.style.width = '15px';
      el.style.height = '15px';
      el.style.borderRadius = '50%';

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <strong>Sound Level:</strong> ${item.sound_level} dB<br/>
        <strong>(Long,Lat):</strong> ${item.location.longitude},${item.location.latitude} <br/>
        <strong>Timestamp:</strong> ${item.timestamp}
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([adjustedLng, adjustedLat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50 });
    }

  }, [filteredData]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <FilterControls
        minSoundLevel={minSoundLevel}
        maxSoundLevel={maxSoundLevel}
        onFilterChange={handleFilterChange}
        minTimestamp={0}
        maxTimestamp={duration}
        selectedTimestamp={sliderValue}
        onTimeChange={handleTimeChange}
      />
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default MapComponent;
