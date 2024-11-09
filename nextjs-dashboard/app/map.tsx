"use client";

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import FilterControls from './map_controls/filter'; // Adjust the path as necessary

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
  const [filteredData, setFilteredData] = useState<MyDocument[]>(data);
  const [minSoundLevel, setMinSoundLevel] = useState<number>(0);
  const [maxSoundLevel, setMaxSoundLevel] = useState<number>(120);

  const handleFilterChange = (min: number, max: number) => {
    setMinSoundLevel(min);
    setMaxSoundLevel(max);

    const newFilteredData = data.filter(
      (item) => item.sound_level >= min && item.sound_level <= max
    );
    setFilteredData(newFilteredData);
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/navigation-day-v1',
      center: [0, 0],
      zoom: 2,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const bounds = new mapboxgl.LngLatBounds();

    const markerElements: mapboxgl.Marker[] = [];

    // Add filtered markers to the map
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
        console.warn(`Invalid coordinates for item with _id ${item._id}`);
        return;
      }

      const color = getColor(item.sound_level);

      const el = document.createElement('div');
      el.style.backgroundColor = color;
      el.style.width = '15px';
      el.style.height = '15px';
      el.style.borderRadius = '50%';

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <strong>Sound Level:</strong> ${item.sound_level} dB<br/>
        <strong>(Long, Lat):</strong> ${item.location.longitude}, ${item.location.latitude}<br/>
        <strong>Timestamp:</strong> ${item.timestamp}
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markerElements.push(marker);
      bounds.extend([lng, lat]);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50 });
    }

    // Cleanup on unmount
    return () => {
      markerElements.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [filteredData]);

  // Function to get color based on sound level
  const getColor = (soundLevel: number) => {
    if (soundLevel < 40) return 'green';
    if (soundLevel >= 40 && soundLevel < 50) return 'lightgreen';
    if (soundLevel >= 50 && soundLevel < 60) return 'yellow';
    if (soundLevel >= 60 && soundLevel < 70) return 'orange';
    if (soundLevel >= 70 && soundLevel < 80) return 'darkorange';
    if (soundLevel >= 80 && soundLevel < 90) return 'red';
    return 'darkred';
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '500px' }}
      />
      <FilterControls
        minSoundLevel={minSoundLevel}
        maxSoundLevel={maxSoundLevel}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default MapComponent;
