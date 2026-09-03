import mongoose, { Connection } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

/**
 * Deliberately NOT thrown at module scope. Next imports every route module
 * while collecting page data at build time, so a module-level throw fails the
 * whole build on any environment that has not been given the variable yet —
 * even though it would be present at runtime. The check belongs at the point
 * of use, where it can surface as a normal request error.
 */

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */

declare global {
  var mongoose: {
    conn: Connection | null
    promise: Promise<Connection> | null
  }
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Add it to .env.local for local development, or ' +
      'to the project\'s Environment Variables in Vercel for deployments.',
    )
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      cached.conn = mongooseInstance.connection
      return mongooseInstance.connection
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB