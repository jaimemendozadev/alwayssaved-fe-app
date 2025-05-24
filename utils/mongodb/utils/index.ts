import mongoose from "mongoose";
export * from './users';

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







