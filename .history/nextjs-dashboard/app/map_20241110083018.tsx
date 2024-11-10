"use client";

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import FilterControls from './map_controls/filter';

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

  // State to manage user location
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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
          setUserLocation([userLng, userLat]);

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
        // FilterControls props
      />
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
};

export default MapComponent;
