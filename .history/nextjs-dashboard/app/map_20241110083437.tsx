// components/map_controls/MapComponent.tsx
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

  // State to manage the selected timestamp
  const [selectedTimestamp, setSelectedTimestamp] = useState<number>(Math.max(...data.map(item => new Date(item.timestamp).getTime())));

  // State to manage sound level filters
  const [filterMinSound, setFilterMinSound] = useState<number>(Math.min(...data.map(item => item.sound_level)));
  const [filterMaxSound, setFilterMaxSound] = useState<number>(Math.max(...data.map(item => item.sound_level)));

  // Request user's location
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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLng = position.coords.longitude;
          const userLat = position.coords.latitude;
          setUserLocation([userLng, userLat]);

          map.setCenter([userLng, userLat]);
          map.setZoom(12);

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

    return () => map.remove();
  }, []);

  // Update markers based on filtered data
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();

    const coordinateCounts = new Map<string, number>();

    data.forEach((item) => {
      const lat = Number(item.location.latitude);
      const lng = Number(item.location.longitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.warn(`Invalid coordinates for item with _id ${item._id}`);
        return;
      }

      const coordKey = `${lat},${lng}`;
      const count = coordinateCounts.get(coordKey) || 0;
      coordinateCounts.set(coordKey, count + 1);
    });

    const coordinateCurrentCounts = new Map<string, number>();

    data.forEach((item) => {
      const lat = Number(item.location.latitude);
      const lng = Number(item.location.longitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.warn(`Invalid coordinates for item with _id ${item._id}`);
        return;
      }

      const coordKey = `${lat},${lng}`;
      const totalMarkersAtCoord = coordinateCounts.get(coordKey) || 1;
      const placedMarkersAtCoord = coordinateCurrentCounts.get(coordKey) || 0;

      let offsetLng = 0;
      let offsetLat = 0;
      if (totalMarkersAtCoord > 1) {
        const offsetStep = 0.001;
        const angle = (2 * Math.PI * placedMarkersAtCoord) / totalMarkersAtCoord;
        offsetLng = offsetStep * Math.cos(angle);
        offsetLat = offsetStep * Math.sin(angle);
      }

      coordinateCurrentCounts.set(coordKey, placedMarkersAtCoord + 1);

      const adjustedLng = lng + offsetLng;
      const adjustedLat = lat + offsetLat;

      bounds.extend([adjustedLng, adjustedLat]);

      let color = 'green';
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

  }, [data]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <FilterControls
        minSoundLevel={Math.min(...data.map(item => item.sound_level))}
        maxSoundLevel={Math.max(...data.map(item => item.sound_level))}
        onFilterChange={(min, max) => {
          setFilterMinSound(min);
          setFilterMaxSound(max);
        }}
        minTimestamp={0}
        maxTimestamp={Math.max(...data.map(item => new Date(item.timestamp).getTime())) - Math.min(...data.map(item => new Date(item.timestamp).getTime()))}
        selectedTimestamp={selectedTimestamp - Math.min(...data.map(item => new Date(item.timestamp).getTime()))}
        onTimeChange={(value) => setSelectedTimestamp(Math.min(...data.map(item => new Date(item.timestamp).getTime())) + value)}
      />
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default MapComponent;