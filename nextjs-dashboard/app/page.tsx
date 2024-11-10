// app/page.tsx
import React from 'react';
import MapComponent from '@/app/map'; // Adjust the import path as necessary
import { GET } from '@/app/api/data/route';
import Navbar from './nav';
import Legend from './map_controls/legend'; // Adjust the path as necessary
import TimeSlider from './map_controls/timeslider'; // Adjust the path as necessary
// import MapPage from './mappage';



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

export default async function Page() {
  const res = await GET();
  const data: MyDocument[] = await res.json();

  return (
    <div>
    <Navbar />

    <main>
      <MapComponent data={data} />
      <Legend />
     

    </main>
    </div>
  );
}
