import { ObjectId } from "mongodb";
import * as dbHelpers from "./dbHelpers";
import processHook from "./processHook";

export const startDbMutation = async ({ root, args, context }, objName, typeMetadata, { create, update, delete: isDelete }) => {
  let [db, client] = await Promise.all([
    typeof root.db === "function" ? await root.db() : root.db,
    typeof root.client === "function" ? await root.client() : root.client
  ]);
  let session = client ? client.startSession() : null;

  //TODO: find some way to check if you're running mongod OR check if on mongos OR on a replica set via session.clientOptions.replicaSet
  // transactions error if started from mongod

  let transaction = false;
  if (session && session.startTransaction) {
    if (create && mutationRequiresTransaction({ typeMetadata, newObjectArgs: args[objName] })) {
      transaction = true;
    }
    if (update && (args._ids || args.Match || mutationRequiresTransaction({ typeMetadata, updateObjectArgs: args }))) {
      transaction = true;
    }
    if (isDelete && deletionRequiresTransaction({ typeMetadata })) {
      transaction = true;
    }
  }
  if (transaction) {
    session.startTransaction();
  }
  context.__mongodb = db;
  return { db, client, session, transaction };
};

export const finishSuccessfulMutation = async (session, transaction, results = {}) => {
  await mutationComplete(session, transaction);
  return mutationSuccessResult({ transaction, ...results });
};

export const mutationSuccessResult = ({ transaction, elapsedTime = 0, ...rest }) => ({
  ...rest,
  success: true,
  Meta: {
    transaction,
    elapsedTime
  }
});

export const mutationComplete = async (session, transaction) => {
  if (transaction) {
    await session.commitTransaction();
  }
};

export const mutationError = async (err, session, transaction) => {
  if (transaction) {
    await session.abortTransaction();
  }
  throw err;
};

export const mutationOver = session => {
  if (session) {
    session.endSession();
  }
};

export const mutationRequiresTransaction = ({ typeMetadata, newObjectArgs, updateObjectArgs }) => {
  if (newObjectArgs) {
    return newObjectMutationRequiresTransaction(typeMetadata, newObjectArgs);
  } else if (updateObjectArgs) {
    return updateObjectMutationRequiresTransaction(typeMetadata, updateObjectArgs);
  }
};

export const deletionRequiresTransaction = ({ typeMetadata }) => {
  return Object.entries(typeMetadata.relationships).some(([k, rel]) => rel.fkField === "_id");
};

export const newObjectMutationRequiresTransaction = (typeMetadata, args) => {
  let relationships = typeMetadata.relationships || {};
  for (let k of Object.keys(relationships)) {
    let relationship = relationships[k];
    if (relationship.oneToMany) {
      if (args[k]) {
        return true;
      }
    } else {
      if (relationship.__isArray) {
        if (args[k]) {
          return true;
        }
      } else if (relationship.__isObject) {
        if (args[k]) {
          return true;
        }
      }
    }
  }
  return false;
};

export const updateObjectMutationRequiresTransaction = (typeMetadata, args) => {
  let relationships = typeMetadata.relationships || {};
  for (let k of Object.keys(relationships)) {
    let relationship = relationships[k];
    if (relationship.oneToMany) {
      if (args[`${k}_ADD`]) {
        return true;
      }
    } else if (relationship.__isObject) {
      if (args.Updates[`${k}_SET`]) {
        return true;
      }
    } else if (relationship.__isArray) {
      if (args.Updates[`${k}_ADD`]) {
        return true;
      }
    }
  }
  return false;
};

export const pullFkFromArray = async (_id, TypeMetadata, key, dbInfo, gqlPacket) => {
  let { hooksObj } = gqlPacket;
  let { db, session } = dbInfo;
  let isString = /String/g.test(TypeMetadata.fields[key]);
  let table = TypeMetadata.table;
  let relType = TypeMetadata.typeName;
  let _ids = Array.isArray(_id) ? _id : [_id];

  _ids = _ids.map(_id => (isString ? "" + _id : ObjectId(_id)));
  let $match = { [key]: { $in: _ids } };
  let updates = { $pull: { [key]: { $in: _ids } } };

  if ((await processHook(hooksObj, relType, "beforeUpdate", $match, updates, { ...gqlPacket, db, session })) === false) {
    return { success: true };
  }
  await dbHelpers.runUpdate(db, table, $match, updates, { session, multi: true });
  await processHook(hooksObj, relType, "afterUpdate", $match, updates, { ...gqlPacket, db, session });
};

export const clearFk = async (_id, TypeMetadata, key, dbInfo, gqlPacket) => {
  let { hooksObj } = gqlPacket;
  let { db, session } = dbInfo;
  let isString = /String/g.test(TypeMetadata.fields[key]);
  let table = TypeMetadata.table;
  let relType = TypeMetadata.typeName;

  _id = isString ? "" + _id : ObjectId(_id);

  let $match = { [key]: _id };
  let updates = { $unset: { [key]: "" } };

  if ((await processHook(hooksObj, relType, "beforeUpdate", $match, updates, { ...gqlPacket, db, session })) === false) {
    return { success: true };
  }
  await dbHelpers.runUpdate(db, table, $match, updates, { session, multi: true });
  await processHook(hooksObj, relType, "afterUpdate", $match, updates, { ...gqlPacket, db, session });
};

export const runMutation = async (session, transaction, run) => {
  try {
    return await run();
  } catch (err) {
    await mutationError(err, session, transaction);
    return { success: false };
  } finally {
    mutationOver(session);
  }
};
