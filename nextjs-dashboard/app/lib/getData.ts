// lib/getData.ts
import clientPromise from "./mongodb";
import { Collection, Document } from "mongodb";

interface MyDocument extends Document {
  name: string;
  value: number;
}

export async function getData(): Promise<MyDocument[]> {
  const client = await clientPromise;
  const db = client.db("mydatabase");
  const collection: Collection<MyDocument> = db.collection("mycollection");

  const data = await collection.find({}).toArray();
  return data;
}
