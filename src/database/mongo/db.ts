import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('You must define MONGODB_URI in .env.local!');
}

// @ts-ignore
let cached = global.mongoose;

if (!cached) {
    // @ts-ignore
    cached = global.mongoose = { conn: null, promise: null }
}

const createDBConnection = async () => {
    if (cached.conn)
        return cached.conn;

    if (!cached.promise) {
        const opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            bufferCommands: false
        }

        cached.promise = mongoose.connect(MONGODB_URI, opts).then(mongoose => {
            return mongoose;
        })
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default createDBConnection;
