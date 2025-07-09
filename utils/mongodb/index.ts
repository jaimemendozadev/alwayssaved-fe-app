export * from './schemamodels/users';
export * from './schemamodels/files';
export * from './schemamodels/notes';
export * from './schemamodels/conversations';
export * from './schemamodels/convomessages';
export * from './utils';

import mongoose from 'mongoose';

interface MongooseGlobal {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  /* eslint-disable-next-line no-var */
  var mongoose: MongooseGlobal; // This must be a `var` and not a `let / const`
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false
      };

      // TODO: May have to refactor and fetch env variables with get ssm getSecret()
      const {
        MONGO_DB_USER,
        MONGO_DB_PASSWORD,
        MONGO_DB_NAME,
        MONGO_DB_BASE_URI,
        MONGO_DB_CLUSTER_NAME
      } = process.env;

      const haveMissingEnvVars =
        MONGO_DB_USER === undefined ||
        MONGO_DB_PASSWORD === undefined ||
        MONGO_DB_BASE_URI === undefined ||
        MONGO_DB_NAME === undefined ||
        MONGO_DB_CLUSTER_NAME === undefined;

      if (haveMissingEnvVars) {
        throw new Error(
          'Please define the necessary MongoDB env vars in your .env file.'
        );
      }

      // See Dev Notes below.
      const connectString = `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}@${MONGO_DB_BASE_URI}/${MONGO_DB_NAME}?retryWrites=true&w=majority&appName=${MONGO_DB_CLUSTER_NAME}`;

      cached.promise = mongoose
        .connect(connectString, opts)
        .then((mongoose) => {
          return mongoose.connection;
        });
    }

    cached.conn = await cached.promise;
  } catch (e) {
    // TODO: Handle in telemetry. Also handle error thrown in catch block in Next.js error page.
    console.log('Error creating/getting DB connection: ', e);
    console.log('\n');
    cached.promise = null;
    throw new Error('There was a problem with the database. Try again later.');
  }

  return cached.conn;
}

/***************************
  Notes
 ***************************

 1) We might have to deal with having separate MongoDB clusters.
    One for development and one for production. Have to check
    pricing.

 2) Had trouble connecting to MongoDB with Next.js. Found solution for dbConnect at:
    https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose/lib/dbConnect.ts

 3) Figured out why MongoDB Atlas kept naming the database as 'test.' Fixed
    problem in connectionString.
 
 4) Have to fix test connection string for local Docker instance when
    testing gets set up.

*/
