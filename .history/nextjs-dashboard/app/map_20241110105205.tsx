// components/map_controls/MapComponent.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import FilterControls from './map_controls/filter'; // Adjust the path as necessary
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';


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
const timestamps = data.map(item => {
  const date = new Date(item.timestamp);
  // Convert the date to EST by adjusting for the offset
  const utcOffset = date.getTimezoneOffset(); // Offset from UTC in minutes
  const estOffset = 5 * 60; // EST is UTC-5 hours (300 minutes)
  const estDate = new Date(date.getTime() - (utcOffset + estOffset) * 60000);

  return estDate.getTime();
});
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const duration = maxTimestamp - minTimestamp;

  const timeWindow: number = 15;

  // Extract sound levels
  const soundLevels = data.map(item => item.sound_level);
  const minSoundLevel = Math.min(...soundLevels);
  const maxSoundLevel = Math.max(...soundLevels);

  // State to manage the selected timestamp
  const [selectedTimestamp, setSelectedTimestamp] = useState<number>(maxTimestamp);

  // State to manage sound level filters
  const [filterMinSound, setFilterMinSound] = useState<number>(minSoundLevel);
  const [filterMaxSound, setFilterMaxSound] = useState<number>(maxSoundLevel);


  const [filterTimeWindow, setFilterTimeWindow] = useState<number>(timeWindow);

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
      Math.abs(itemTimestamp - selectedTimestamp) <= (filterTimeWindow * 30000) &&

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

  const [mapMode, setMapMode] = useState<string>("day");

  // Handle change of radio button
  const handleMapModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMapMode(event.target.value);
  };

  // const geojsonData: FeatureCollection<Geometry, GeoJsonProperties> = useMemo(() => ({
  //   type: 'FeatureCollection',
  //   features: filteredData.map(item => ({
  //     type: 'Feature',
  //     properties: {
  //       id: item._id,
  //       sound_level: item.sound_level,
  //       timestamp: item.timestamp,
  //     },
  //     geometry: {
  //       type: 'Point',
  //       coordinates: [item.location.longitude, item.location.latitude],
  //     },
  //   })),
  // }), [filteredData]);

  // Initialize the map only once
  useEffect(() => {
    let mapStyle: string = '';
    if (mapMode == 'day') {
      mapStyle = 'navigation-day-v1';
    } else if (mapMode == 'satellite') {
      mapStyle = 'satellite-streets-v12'
    } else {
      mapStyle = 'dark-v11'
    }

    console.log("my map style is: ", mapStyle)

    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/' + mapStyle,
      center: [0, 0],
      zoom: 12,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;



    // map.on('load', () => {
    //   console.log('Map has loaded.');

    //   // Add GeoJSON source
    //   if (!map.getSource('soundData')) {
    //     map.addSource('soundData', {
    //       type: 'geojson',
    //       data: geojsonData, // Initial data
    //       // Optional: enable clustering if desired
    //       // cluster: true,
    //       // clusterMaxZoom: 14,
    //       // clusterRadius: 50,
    //     });

    //     console.log('GeoJSON source added.');

    //     // Add Heatmap Layer with Enhanced Smoothness
    //     map.addLayer(
    //       {
    //         id: 'heatmap-layer',
    //         type: 'heatmap',
    //         source: 'soundData',
    //         maxzoom: 17,
    //         paint: {
    //           // Adjust the weight based on sound_level
    //           'heatmap-weight': [
    //             'interpolate',
    //             ['linear'],
    //             ['get', 'sound_level'],
    //             0, 0,
    //             40, 0.2,
    //             50, 0.4,
    //             60, 0.6,
    //             70, 0.7,
    //             80, 1,
    //             90, 1,
    //           ],
    //           // Control the intensity of the heatmap
    //           'heatmap-intensity': [
    //             'interpolate',
    //             ['linear'],
    //             ['zoom'],
    //             0, 1,
    //             15, 3,
    //           ],
    //           // Define the color gradient for the heatmap
    //           'heatmap-color': [
    //             'interpolate',
    //             ['linear'],
    //             ['heatmap-density'],
    //             0, 'rgba(33,102,172,0)',
    //             0.1, 'rgb(103,169,207)',
    //             0.3, 'rgb(209,229,240)',
    //             0.5, 'rgb(253,219,199)',
    //             0.7, 'rgb(239,138,98)',
    //             1, 'rgb(178,24,43)',
    //           ],
    //           // Adjust the radius of influence for each data point
    //           'heatmap-radius': [
    //             'interpolate',
    //             ['linear'],
    //             ['zoom'],
    //             0, 15, // Increased from 10 to 15
    //             15, 40, // Increased from 30 to 40
    //           ],
    //           // Adjust the opacity of the heatmap
    //           'heatmap-opacity': [
    //             'interpolate',
    //             ['linear'],
    //             ['zoom'],
    //             7, 0.9, // Slightly reduced for better blending
    //             15, 0.6,
    //           ],
    //           // Optional: Additional smoothing with heatmap-aggregation
    //         },
    //       },
    //       'waterway-label' // Ensure this layer exists in your style
    //     );

    //     console.log('Heatmap layer added with enhanced properties.');
    //   }
    // });



    // Cleanup on unmount
    return () => map.remove();
  }, [mapMode]);

  // Update markers whenever filteredData changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

        /// Request user's location and set map center if granted
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      if (mapRef.current) { // Ensure map is initialized
        const userLng = position.coords.longitude;
        const userLat = position.coords.latitude;

        // Center map on user's location
        mapRef.current.setCenter([userLng, userLat]);
        mapRef.current.setZoom(12);

        // Add a marker at the user's location
        new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([userLng, userLat])
          .setPopup(new mapboxgl.Popup().setText("You are here"))
          .addTo(mapRef.current);
      }
    },
    (error) => {
      console.error("Location access denied or unavailable:", error);
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}
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

      const estDate = new Date(new Date(item.timestamp).getTime() - (new Date(item.timestamp).getTimezoneOffset() + 300) * 60000 - 4.5);
      const estTimestamp = estDate.toLocaleString();

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <strong>Sound Level:</strong> ${item.sound_level} dB<br/>
        <strong>(Long,Lat):</strong> ${item.location.longitude},${item.location.latitude} <br/>
        <strong>Timestamp (EST):</strong> ${estTimestamp}
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
        windowSize={timeWindow}
        windowChange={setFilterTimeWindow}
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

      <div style={styles.radios}>
        <h2>Select Map Mode</h2>
        <div>
          <label>
            <input
              type="radio"
              value="day"
              checked={mapMode === "day"}
              onChange={handleMapModeChange}
            />
            Day
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              value="night"
              checked={mapMode === "night"}
              onChange={handleMapModeChange}
            />
            Night
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              value="satellite"
              checked={mapMode === "satellite"}
              onChange={handleMapModeChange}
            />
            Satellite
          </label>
        </div>

        <p>Current Map Mode: {mapMode}</p>
      </div>

    </div>
  );
};

const styles = {
  radios: {
    position: 'absolute' as 'absolute',
    bottom: '15%',
    right: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slight transparency
    padding: '15px',
    borderRadius: '8px',
    fontSize: '14px',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
    zIndex: 1000, // Ensure the filter controls are always on top
    maxWidth: '300px',
    width: '90%', // Responsive width
  },
};

export default MapComponent;
