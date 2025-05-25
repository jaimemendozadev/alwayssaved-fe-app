import mongoose from "mongoose";

/***************************** 
 * Types & Interfaces
******************************/


export type ObjectIdOrString = string | mongoose.Types.ObjectId;



/***************************** 
 * Util Functions
******************************/


export const _getTestObjectID = (): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId();
};

export const isMongoObjectId = (targetID: mongoose.Types.ObjectId): boolean => {
  return targetID instanceof mongoose.Types.ObjectId;
}

export const getObjectIDFromString = (
  stringID: string
): mongoose.Types.ObjectId => {
  return mongoose.Types.ObjectId.createFromHexString(stringID)
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
    return doc.map(item => deepLean(item, cache));
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





