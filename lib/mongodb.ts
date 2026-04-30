import { MongoClient } from "mongodb";

const options = {};

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise() {
  if (clientPromise) return clientPromise;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI env var");
  }

  const client = new MongoClient(uri, {
    ...options,
    serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
  });

  const connectWithLogging = async () => {
    try {
      const connectedClient = await client.connect();
      console.log("✅ Successfully connected to MongoDB Atlas");
      return connectedClient;
    } catch (err) {
      console.error("❌ MongoDB connection failed:", (err as Error).message);
      throw err;
    }
  };

  if (process.env.NODE_ENV === "development") {
    if (!global.__mongoClientPromise) {
      global.__mongoClientPromise = connectWithLogging();
    }
    clientPromise = global.__mongoClientPromise;
  } else {
    clientPromise = connectWithLogging();
  }

  return clientPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  const dbName = process.env.MONGODB_DB || "app";
  return client.db(dbName);
}

