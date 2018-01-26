import { MongoError } from "mongodb";

export async function runUpdate(db, table, $match, updates, options) {
  if (updates.$set || updates.$inc || updates.$push || updates.$pull || updates.$addToSet) {
    try {
      await db.collection(table).update($match, updates, options);
    } catch (err) {
      if (err instanceof MongoError) {
        throw `The following error was thrown by Mongo when attempting to perform this update: ${err.toString()}`;
      } else {
        throw err;
      }
    }
  }
}
