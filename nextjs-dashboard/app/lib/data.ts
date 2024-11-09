// app/api/data/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "./mongodb";
import { Collection } from "mongodb";

interface DeviceDocument {
  _id: string;
  device_name: string;
  location: Object;
  created_at: string;
  status: string;
}
interface IdDocument {
  _id: string;
  sequence_value: number;
}

export async function Get_device_documents() {
  const client = await clientPromise;
  const db = client.db("sound_monitoring");
  const collection: Collection<DeviceDocument> = db.collection("devices");

  const data = await collection.find({}).toArray();
  return NextResponse.json(data);
}

export async function getCurrentSoundReadingId(): Promise<number | null> {
  const client = await clientPromise;
  const db = client.db("sound_monitoring");
  const collection: Collection<IdDocument> = db.collection("ids");

  // Find the document where _id is "sound_reading_id"
  const document = await collection.findOne({ _id: "soundReadingId" });

  if (document) {
    // Return the sequence_value if the document is found
    return document.sequence_value;
  } else {
    // Return null if the document is not found
    return null;
  }
}

// export async function POST(request: NextRequest) {
//   const client = await clientPromise;
//   const db = client.db("mydatabase");
//   const collection: Collection<MyDocument> = db.collection("mycollection");

//   const { name, value } = await request.json() as MyDocument;
//   const result = await collection.insertOne({ name, value });
//   return NextResponse.json(result);
// }
