import { MongoError } from "mongodb";
import { processHook } from "mongo-graphql-starter";

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

export async function runDelete(db, table, $match) {
  try {
    await db.collection(table).remove($match);
  } catch (err) {
    if (err instanceof MongoError) {
      throw `The following error was thrown by Mongo when attempting to perform this deletion: ${err.toString()}`;
    } else {
      throw err;
    }
  }
}

export async function processInsertion(db, newObjectToCreateMaybe, options) {
  let results = await processInsertions(db, [newObjectToCreateMaybe], options);
  return results[0];
}

export async function processInsertions(db, newObjectsToCreateMaybe, { typeMetadata, hooksObj, root, args, context, ast }) {
  let newObjectPackets = newObjectsToCreateMaybe.map(obj => ({
    obj,
    preInsertResult: processHook(hooksObj, typeMetadata.typeName, "beforeInsert", obj, root, args, context, ast)
  }));

  let newObjects = [];
  for (let packet of newObjectPackets) {
    if ((await packet.preInsertResult) !== false) {
      newObjects.push(packet.obj);
    }
  }
  if (!newObjects.length) return [];

  newObjects = await runMultipleInserts(db, typeMetadata.table, newObjects);
  await Promise.all(newObjects.map(obj => processHook(hooksObj, typeMetadata.typeName, "afterInsert", obj, root, args, context, ast)));
  return newObjects;
}

export async function runInsert(db, table, newObject) {
  try {
    await db.collection(table).insert(newObject);
    return newObject;
  } catch (err) {
    if (err instanceof MongoError) {
      throw `The following error was thrown by Mongo when attempting to perform this insertion: ${err.toString()}`;
    } else {
      throw err;
    }
  }
}

export async function runMultipleInserts(db, table, newObjects) {
  try {
    await Promise.all(newObjects.map(obj => db.collection(table).insert(obj)));
    return newObjects;
  } catch (err) {
    if (err instanceof MongoError) {
      throw `The following error was thrown by Mongo when attempting to perform this insertion: ${err.toString()}`;
    } else {
      throw err;
    }
  }
}

export async function runQuery(db, table, aggregateItems) {
  try {
    return await db
      .collection(table)
      .aggregate(aggregateItems)
      .toArray();
  } catch (err) {
    if (err instanceof MongoError) {
      throw `The following error was thrown by Mongo when attempting to perform this query: ${err.toString()}`;
    } else {
      throw err;
    }
  }
}
