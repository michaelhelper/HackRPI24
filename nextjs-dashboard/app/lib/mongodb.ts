// lib/mongodb.ts
import { MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to prevent multiple connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new MongoClient instance
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
