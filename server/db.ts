import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongodInstance: MongoMemoryServer | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`[Database] Connecting to external MongoDB: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
      await mongoose.connect(uri);
      console.log('[Database] Connected to external MongoDB successfully.');
      return mongoose;
    } catch (err: any) {
      console.warn(`[Database] Failed to connect to external MongoDB: ${err.message}. Falling back to embedded MongoDB.`);
    }
  }

  // Fallback to embedded MongoMemoryServer
  if (!mongodInstance) {
    console.log('[Database] Initializing embedded MongoDB server...');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    console.log(`[Database] Embedded MongoDB running at: ${memoryUri}`);
    await mongoose.connect(memoryUri);
    console.log('[Database] Mongoose connected to embedded MongoDB successfully.');
  }

  return mongoose;
}

export async function closeDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}
