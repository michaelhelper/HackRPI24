import { NextRequest, NextResponse } from "next/server";
import clientPromise from '../../../lib/mongodb';

import { Collection } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("sound_monitoring");
    const collection: Collection = db.collection("sound_readings");

    const totalQueries = await collection.countDocuments();
    return NextResponse.json({ totalQueries });
  } catch (error) {
    console.error("Error fetching total queries: ", error);
    return NextResponse.json({ error: 'Unable to fetch total queries' }, { status: 500 });
  }
}


interface SoundReading {
  _id: string;
  device_id: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  sound_level: number;
}


export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("sound_monitoring");
    const collection: Collection<SoundReading> = db.collection("sound_readings");

    // Fetch the total number of entries using the other API (totalqueries/route.ts)
    const totalQueriesResponse = await GET();
    if (!totalQueriesResponse.ok) {
      throw new Error("Failed to fetch total queries");
    }
    const { totalQueries } = await totalQueriesResponse.json();
    const newTotalQueries = totalQueries + 1;
    const newId = `reading${newTotalQueries}`;

    // Parse the request body to get the new data
    const { _id, device_id, timestamp, location, sound_level } = await request.json() as SoundReading;

    // Insert the new data into the collection
    const result = await collection.insertOne({
      _id: newId,
      device_id,
      timestamp: new Date(),
      location,
      sound_level,
    });

    // Return the response including the incremented total number of entries
    return NextResponse.json({
      result,
      newTotalQueries,
    });
  } catch (error) {
    console.error("Error inserting new sound reading: ", error);
    return NextResponse.json({ error: 'Unable to insert new sound reading' }, { status: 500 });
  }
}
