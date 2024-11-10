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

    // Request user's location and set map center if granted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLng = position.coords.longitude;
          const userLat = position.coords.latitude;

          // Center map on user's location
          map.setCenter([userLng, userLat]);
          map.setZoom(12);

          // Add a marker at the user's location
          new mapboxgl.Marker({ color: 'blue' })
            .setLngLat([userLng, userLat])
            .setPopup(new mapboxgl.Popup().setText("You are here"))
            .addTo(map);
        },
        (error) => {
          console.error("Location access denied or unavailable:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

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

      bounds.extend([lng, lat]);

      const el = document.createElement('div');
      el.style.backgroundColor = 'green'; // Default color
      el.style.width = '15px';
      el.style.height = '15px';
      el.style.borderRadius = '50%';

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <strong>Sound Level:</strong> ${item.sound_level} dB<br/>
        <strong>(Long,Lat):</strong> ${item.location.longitude},${item.location.latitude} <br/>
        <strong>Timestamp:</strong> ${item.timestamp}
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
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