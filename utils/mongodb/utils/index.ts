import mongoose from 'mongoose';

import { getSecret } from '@/utils/aws';

const AWS_PARAM_BASE_PATH = process.env.AWS_PARAM_BASE_PATH;

/*****************************
 * Types & Interfaces
 ******************************/

export type ObjectIdOrString = string | mongoose.Types.ObjectId;

/*****************************
 * Util Functions
 ******************************/

interface MongoEnvVariables {
  MONGO_DB_USER: string;
  MONGO_DB_PASSWORD: string;
  MONGO_DB_NAME: string;
  MONGO_DB_BASE_URI: string;
  MONGO_DB_CLUSTER_NAME: string;
}

const dbVarKeys: (keyof MongoEnvVariables)[] = [
  'MONGO_DB_USER',
  'MONGO_DB_PASSWORD',
  'MONGO_DB_NAME',
  'MONGO_DB_BASE_URI',
  'MONGO_DB_CLUSTER_NAME'
];

export const getDBVarsByEnv = async (
  env: string
): Promise<MongoEnvVariables> => {

  if (env === 'development') {
    const {
      MONGO_DB_USER,
      MONGO_DB_PASSWORD,
      MONGO_DB_NAME,
      MONGO_DB_BASE_URI,
      MONGO_DB_CLUSTER_NAME
    } = process.env;

    if (
      !MONGO_DB_USER ||
      !MONGO_DB_PASSWORD ||
      !MONGO_DB_BASE_URI ||
      !MONGO_DB_NAME ||
      !MONGO_DB_CLUSTER_NAME
    ) {
      throw new Error(
        'Please define the necessary MongoDB env vars in your .env file.'
      );
    }

    return {
      MONGO_DB_USER,
      MONGO_DB_PASSWORD,
      MONGO_DB_NAME,
      MONGO_DB_BASE_URI,
      MONGO_DB_CLUSTER_NAME
    };
  }

  const results = await Promise.allSettled(
    dbVarKeys.map(async (key) => ({
      key,
      secret: await getSecret(`/${AWS_PARAM_BASE_PATH}/${key}`)
    }))
  );

  const dbConfig: Partial<MongoEnvVariables> = {};

  results.forEach((res) => {
    if (res.status === 'fulfilled' && res.value.secret !== null) {
      dbConfig[res.value.key] = res.value.secret;
    } else if (res.status === 'rejected') {
      console.warn(
        `Failed to get secret for ${res.reason?.key ?? 'unknown key'}:`,
        res.reason
      );
    }
  });

  // Ensure all required fields are present
  dbVarKeys.forEach((key) => {
    if (!dbConfig[key]) {
      throw new Error(`Missing value for required DB config key: ${key}`);
    }
  });

  return dbConfig as MongoEnvVariables;
};

export const _getTestObjectID = (): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId();
};

export const isMongoObjectId = (targetID: mongoose.Types.ObjectId): boolean => {
  return targetID instanceof mongoose.Types.ObjectId;
};

export const getObjectIDFromString = (
  stringID: string
): mongoose.Types.ObjectId => {
  return mongoose.Types.ObjectId.createFromHexString(stringID);
};

// Utility to check if value is plain (not Date, ObjectId, etc.)
export const isPlainObject = (val: any) =>
  val !== null &&
  typeof val === 'object' &&
  !Array.isArray(val) &&
  !(val instanceof Date) &&
  !(val instanceof mongoose.Types.ObjectId);

/**
 * Main deepLean function with circular reference + subdoc deduplication
 */
export function deepLean(doc: any, cache = new WeakMap()): any {
  if (doc == null) return doc;

  // Convert ObjectIds to string
  if (doc instanceof mongoose.Types.ObjectId) {
    return doc.toString();
  }

  // Leave Dates as-is
  if (doc instanceof Date) {
    return doc;
  }

  // Recurse over arrays
  if (Array.isArray(doc)) {
    return doc.map((item) => deepLean(item, cache));
  }

  // If already processed, reuse the result (for shared or circular refs)
  if (typeof doc === 'object') {
    if (cache.has(doc)) {
      return cache.get(doc);
    }

    // Convert to plain object if it's a Mongoose doc
    const plain = doc.toObject?.({ virtuals: false }) ?? doc;
    const result: Record<string, any> = {};

    // Store placeholder in cache early to prevent infinite loops
    cache.set(doc, result);

    for (const key in plain) {
      if (Object.prototype.hasOwnProperty.call(plain, key)) {
        result[key] = deepLean(plain[key], cache);
      }
    }

    return result;
  }

  // Primitives
  return doc;
}
