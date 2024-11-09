// app/api/data/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { Collection } from "mongodb";

interface MyDocument {
  name: string;
  value: number;
}

export async function GET() {
  const client = await clientPromise;
  const db = client.db("sound_monitoring");
  const collection: Collection<MyDocument> = db.collection("sound_readings");
  const data = await collection.find({}).toArray();
  return NextResponse.json(data);
}



export async function POST(request: NextRequest) {
  const client = await clientPromise;
  const db = client.db("mydatabase");
  const collection: Collection<MyDocument> = db.collection("mycollection");

  const { name, value } = await request.json() as MyDocument;
  const result = await collection.insertOne({ name, value });
  return NextResponse.json(result);
}
