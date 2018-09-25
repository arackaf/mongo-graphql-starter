import { MongoIdType, MongoIdArrayType, DateType, StringType, StringArrayType, IntArrayType, IntType, FloatType, FloatArrayType } from "./dataTypes";
import { ObjectId } from "mongodb";
import processHook from "./processHook";
import { processInsertion, processInsertions } from "./dbHelpers";

import escapeStringRegexp from "escape-string-regexp";

export function getMongoProjection(requestMap, objectMetaData, args, extrasPackets) {
  return getProjectionObject(requestMap, objectMetaData, args, extrasPackets);
}
function getProjectionObject(requestMap, objectMetaData, args = {}, extrasPackets, currentObject = "", increment = 0) {
  let allRelationships = objectMetaData.relationships || {};

  let result = [...requestMap.entries()].reduce((hash, [field, selectionEntry]) => {
    let entry = objectMetaData.fields[field];
    if (!entry) {
      if (allRelationships[field]) {
        let fkField = allRelationships[field].fkField;
        hash[fkField] = currentObject ? currentObject + "." + fkField : "$" + fkField;
      }
      return hash;
    }

    if (selectionEntry === true) {
      if (entry.__isDate) {
        let format = args[field + "_format"] || entry.format;
        hash[field] = { $dateToString: { format, date: currentObject ? currentObject + "." + field : "$" + field } };
      } else {
        hash[field] = currentObject ? currentObject + "." + field : "$" + field;
      }
    } else if (entry.__isArray) {
      let currentObjName = "item" + (increment || "");
      hash[field] = {
        $map: {
          input: currentObject ? currentObject + "." + field : "$" + field,
          as: currentObjName,
          in: getProjectionObject(selectionEntry, entry.type, {}, null, "$$" + currentObjName, increment + 1)
        }
      };
    } else {
      hash[field] = getProjectionObject(selectionEntry, entry.type, {}, null, currentObject ? currentObject + "." + field : "$" + field, increment);
    }
    return hash;
  }, {});

  return result;
}

export function getMongoFilters(args, objectMetaData) {
  return fillMongoFiltersObject(args, objectMetaData);
}
const numberArrayOperations = new Set(["lt", "lte", "gt", "gte"]);
const numberArrayEmOperations = new Set(["emlt", "emlte", "emgt", "emgte"]);
const stringOps = new Set(["contains", "startsWith", "endsWith", "regex"]);
const stringArrayOps = new Set(["textContains", "startsWith", "endsWith", "regex"]);
function fillMongoFiltersObject(args, objectMetaData, hash = {}, prefix = "") {
  let fields = objectMetaData.fields;
  Object.keys(args).forEach(k => {
    if (k === "OR" && args.OR != null) {
      if (!Array.isArray(args.OR)) {
        throw "Non array passed to OR - received " + hash.OR;
      }
      hash.$or = args.OR.map(packetArgs => fillMongoFiltersObject(packetArgs, objectMetaData, void 0, prefix));
    } else if (fields[k]) {
      if (typeof fields[k] === "object" && fields[k].__isDate) {
        args[k] = new Date(args[k]);
      } else if (fields[k].__isObject) {
        fillMongoFiltersObject(args[k], fields[k].type, hash, prefix + k + ".");
        return;
      } else if (fields[k].__isArray) {
        hash[prefix + k] = { $elemMatch: fillMongoFiltersObject(args[k], fields[k].type) };
        return;
      } else if (fields[k] === MongoIdType) {
        args[k] = ObjectId(args[k]);
      } else if (fields[k] === MongoIdArrayType) {
        args[k] = args[k].map(val => ObjectId(val));
      }

      hash[prefix + k] = args[k];
    } else if (k.indexOf("_") >= 0) {
      let pieces = k.split("_");
      let queryOperation = pieces.slice(-1)[0];
      let fieldName = pieces.slice(0, pieces.length - 1).join("_");
      let field = objectMetaData.fields[fieldName];
      fieldName = prefix + fieldName;
      let isDate = typeof field === "object" && field.__isDate;

      if (queryOperation !== "format" && isDate) {
        args[k] = queryOperation === "in" ? args[k].map(val => new Date(val)) : new Date(args[k]);
      }

      if (queryOperation == "count") {
        ensure(hash, fieldName, () => (hash[fieldName].$size = args[k]));
      } else if (queryOperation === "in") {
        if (field === MongoIdArrayType) {
          ensure(hash, fieldName, () => (hash[fieldName].$in = args[k].map(arr => arr.map(val => ObjectId(val)))));
        } else if (field == MongoIdType) {
          ensure(hash, fieldName, () => (hash[fieldName].$in = args[k].map(val => ObjectId(val))));
        } else {
          ensure(hash, fieldName, () => (hash[fieldName].$in = args[k]));
        }
      } else if (queryOperation == "ne") {
        ensure(hash, fieldName, () => (hash[fieldName].$ne = args[k]));
      } else {
        if (field === StringType) {
          if (stringOps.has(queryOperation) && hash[fieldName] && hash[fieldName].$regex) {
            throw "Only one of startsWith, endsWith, contains, and regex can be specified for a given string field. Combine all of these filters into a single regex";
          }
          if (queryOperation === "contains") {
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp(escapeStringRegexp(args[k]), "i")));
          } else if (queryOperation === "startsWith") {
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp("^" + escapeStringRegexp(args[k]), "i")));
          } else if (queryOperation === "endsWith") {
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp(escapeStringRegexp(args[k]) + "$", "i")));
          } else if (queryOperation == "regex") {
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp(args[k], "i")));
          }
        } else if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          if (stringArrayOps.has(queryOperation) && hash[fieldName] && hash[fieldName].$regex) {
            throw "Only one of startsWith, endsWith, textContains, and regex can be specified for a given string field. Combine all of these filters into a single regex";
          }
          if (queryOperation == "contains" || queryOperation == "containsAny") {
            ensure(hash, fieldName);
            ensureArr(hash[fieldName], "$in");
            if (queryOperation == "contains") {
              hash[fieldName].$in.push(field === MongoIdArrayType ? ObjectId(args[k]) : args[k]);
            } else {
              hash[fieldName].$in.push(...args[k].map(item => (field === MongoIdArrayType ? ObjectId(item) : item)));
            }
          } else if (queryOperation == "textContains") {
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp(escapeStringRegexp(args[k]), "i")));
          } else if (queryOperation === "startsWith") {
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp("^" + escapeStringRegexp(args[k]), "i")));
          } else if (queryOperation === "endsWith") {
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp(escapeStringRegexp(args[k]) + "$", "i")));
          } else if (queryOperation == "regex") {
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp(args[k], "i")));
          } else if (numberArrayOperations.has(queryOperation)) {
            if (queryOperation === "lt") {
              ensure(hash, fieldName, () => (hash[fieldName].$lt = args[k]));
            } else if (queryOperation === "lte") {
              ensure(hash, fieldName, () => (hash[fieldName].$lte = args[k]));
            } else if (queryOperation === "gt") {
              ensure(hash, fieldName, () => (hash[fieldName].$gt = args[k]));
            } else if (queryOperation === "gte") {
              ensure(hash, fieldName, () => (hash[fieldName].$gte = args[k]));
            }
          } else if (numberArrayEmOperations.has(queryOperation)) {
            ensure(hash, fieldName);
            ensure(hash[fieldName], "$elemMatch");
            if (queryOperation === "emlt") {
              hash[fieldName].$elemMatch.$lt = args[k];
            } else if (queryOperation === "emlte") {
              hash[fieldName].$elemMatch.$lte = args[k];
            } else if (queryOperation === "emgt") {
              hash[fieldName].$elemMatch.$gt = args[k];
            } else if (queryOperation === "emgte") {
              hash[fieldName].$elemMatch.$gte = args[k];
            }
          }
        } else if (field === IntType || field === FloatType || isDate) {
          if (queryOperation === "lt") {
            ensure(hash, fieldName, () => (hash[fieldName].$lt = args[k]));
          } else if (queryOperation === "lte") {
            ensure(hash, fieldName, () => (hash[fieldName].$lte = args[k]));
          } else if (queryOperation === "gt") {
            ensure(hash, fieldName, () => (hash[fieldName].$gt = args[k]));
          } else if (queryOperation === "gte") {
            ensure(hash, fieldName, () => (hash[fieldName].$gte = args[k]));
          }
        }
      }
    }
  });
  return hash;
}

function ensure(hash, fieldName, cb = () => {}) {
  if (!hash[fieldName]) {
    hash[fieldName] = {};
  }
  cb();
}
function ensureArr(hash, fieldName, cb = () => {}) {
  if (!hash[fieldName]) {
    hash[fieldName] = [];
  }
  cb();
}

export function parseRequestedFields(ast, queryName, force) {
  let { requestMap } = getNestedQueryInfo(ast, queryName);
  if (force) {
    force.forEach(field => requestMap.set(field, true));
  }
  return requestMap;
}
export function getNestedQueryInfo(ast, queryName) {
  let fieldNode = ast.fieldNodes ? ast.fieldNodes.find(fn => fn.kind == "Field") : ast;

  if (typeof queryName === "string") {
    for (let path of queryName.split(".")) {
      if (!fieldNode) {
        break;
      }
      fieldNode = fieldNode.selectionSet.selections.find(fn => fn.kind == "Field" && fn.name && fn.name.value == path);
    }
  }

  if (fieldNode) {
    return {
      requestMap: getSelections(fieldNode),
      ast: fieldNode
    };
  } else {
    return {
      requestMap: new Map(),
      ast: null
    };
  }
}

function getSelections(fieldNode) {
  return new Map(fieldNode.selectionSet.selections.map(sel => [sel.name.value, sel.selectionSet == null ? true : getSelections(sel)]));
}

export async function newObjectFromArgs(args, typeMetadata, relationshipLoadingUtils = {}) {
  let { db, dbHelpers, ...rest } = relationshipLoadingUtils;
  let relationships = typeMetadata.relationships || {};
  for (let k of Object.keys(relationships)) {
    let relationship = relationships[k];
    if (relationship.oneToMany) {
      continue;
    }
    if (relationship.__isArray) {
      if (args[k]) {
        let newObjectCandidates = await Promise.all(args[k].map(o => newObjectFromArgs(o, relationship.type, relationshipLoadingUtils)));
        let newObjects = await insertObjects(newObjectCandidates, args[k], relationship.type, { db, ...rest });

        let fkType = typeMetadata.fields[relationship.fkField];
        let keyField = relationship.keyField;

        if (!args[`${relationship.fkField}`]) {
          args[`${relationship.fkField}`] = [];
        }
        args[`${relationship.fkField}`].push(...newObjects.map(o => (fkType == StringArrayType ? "" + o[keyField] : o[keyField])));
      }
    } else if (relationship.__isObject) {
      if (args[k]) {
        let newObjectCandidate = await Promise.resolve(newObjectFromArgs(args[k], relationship.type, relationshipLoadingUtils));
        let newObject = await handleInsertion(newObjectCandidate, args[k], relationship.type, { db, ...rest });
        let fkType = typeMetadata.fields[relationship.fkField];

        if (newObject) {
          if (!args[`${relationship.fkField}`]) {
            args[`${relationship.fkField}`] = [];
          }
          args[`${relationship.fkField}`] = fkType == StringType ? "" + newObject._id : newObject._id;
        }
      }
    }
  }

  let keyValuePairs = (await Promise.all(
    Object.keys(args).map(async k => {
      let field = typeMetadata.fields[k];
      if (!field) return null;

      if (field == DateType || field.__isDate) {
        return [k, new Date(args[k])];
      } else if (field.__isArray) {
        return [k, await Promise.all(args[k].map(argItem => newObjectFromArgs(argItem, field.type, relationshipLoadingUtils)))];
      } else if (field.__isObject) {
        return [k, await newObjectFromArgs(args[k], field.type, relationshipLoadingUtils)];
      } else if (field === MongoIdArrayType) {
        return [k, args[k].map(val => ObjectId(val))];
      } else if (field === MongoIdType) {
        return [k, ObjectId(args[k])];
      } else {
        return [k, args[k]];
      }
    })
  )).filter(x => x);

  return keyValuePairs.reduce((obj, [k, val]) => ((obj[k] = val), obj), {});
}

export async function setUpOneToManyRelationships(newObject, args, typeMetadata, options = {}) {
  let relationships = typeMetadata.relationships || {};
  for (let k of Object.keys(relationships)) {
    let relationship = relationships[k];
    if (relationship.oneToMany) {
      if (args[k]) {
        args[k].forEach(newObj => {
          let keyValue = newObject[relationship.fkField];
          if (typeMetadata.fields[relationship.fkField] == MongoIdType) {
            keyValue = "" + keyValue;
          }
          if (/Array/.test(relationship.type.fields[relationship.keyField])) {
            if (!newObj[relationship.keyField]) {
              newObj[relationship.keyField] = [];
            }
            newObj[relationship.keyField].push(keyValue);
          } else {
            newObj[relationship.keyField] = keyValue;
          }
        });
        let toSave = await Promise.all(args[k].map(o => newObjectFromArgs(o, relationship.type, options)));
        await insertObjects(toSave, args[k], relationship.type, options);
      }
    }
  }
}

export async function setUpOneToManyRelationshipsForUpdate(_ids, args, typeMetadata, options = {}) {
  let relationships = typeMetadata.relationships || {};
  for (let k of Object.keys(relationships)) {
    let relationship = relationships[k];
    if (relationship.oneToMany) {
      let coll = args[`${k}_ADD`];
      if (coll) {
        coll.forEach(newObj => {
          if (/Array/.test(relationship.type.fields[relationship.keyField])) {
            if (!newObj[relationship.keyField]) {
              newObj[relationship.keyField] = [];
            }
            newObj[relationship.keyField].push(..._ids);
          } else {
            newObj[relationship.keyField] = _ids[0];
          }
        });
        let toSave = await Promise.all(coll.map(o => newObjectFromArgs(o, relationship.type, options)));
        await insertObjects(toSave, coll, relationship.type, options);
      }
    }
  }
}

function parseRequestedHierarchy(ast, requestMap, type, args = {}, anchor) {
  let extrasPackets = new Map([]);

  if (type.relationships) {
    Object.keys(type.relationships).forEach(name => {
      let relationship = type.relationships[name];
      let { ast: astNew, requestMap } = getNestedQueryInfo(ast, typeof anchor === "string" ? anchor + "." + name : name);

      if (requestMap.size) {
        extrasPackets.set(name, parseRequestedHierarchy(astNew, requestMap, relationship.type));
      }
    });
  }

  return {
    extrasPackets,
    requestMap,
    $project: requestMap.size ? getMongoProjection(requestMap, type, args, extrasPackets) : null
  };
}

export function decontructGraphqlQuery(args, ast, objectMetaData, queryName, options = {}) {
  let $match = getMongoFilters(args, objectMetaData);
  let requestMap, metadataRequested, $project, extrasPackets;

  if (ast && queryName) {
    requestMap = parseRequestedFields(ast, queryName, options.force || []);
    metadataRequested = parseRequestedFields(ast, "Meta");
    ({ $project, extrasPackets } = parseRequestedHierarchy(ast, requestMap, objectMetaData, args, queryName));
  } else {
    extrasPackets = new Map([]);
  }
  let sort = args.SORT;
  let sorts = args.SORTS;
  let $sort;
  let $limit;
  let $skip;

  if (sort) {
    $sort = sort;
  } else if (sorts) {
    $sort = {};
    sorts.forEach(packet => {
      Object.assign($sort, packet);
    });
  }

  if (args.LIMIT != null || args.SKIP != null) {
    $limit = args.LIMIT;
    $skip = args.SKIP;
  } else if (args.PAGE != null && args.PAGE_SIZE != null) {
    $limit = args.PAGE_SIZE;
    $skip = (args.PAGE - 1) * args.PAGE_SIZE;
  }

  return { $match, $project, $sort, $limit, $skip, metadataRequested, extrasPackets };
}

export async function getUpdateObject(updatesObject, typeMetadata, relationshipLoadingUtils = {}) {
  let $set = {};
  let $inc = {};
  let $push = {};
  let $pull = {};
  let $addToSet = {};

  await getUpdateObjectContents(updatesObject, typeMetadata, "", $set, $inc, $push, $pull, $addToSet, relationshipLoadingUtils);
  let result = { $set, $inc, $push, $pull, $addToSet };
  Object.keys(result).forEach(k => {
    if (!Object.keys(result[k]).length) {
      delete result[k];
    }
  });
  return result;
}

async function getUpdateObjectContents(updatesObject, typeMetadata, prefix, $set, $inc, $push, $pull, $addToSet, relationshipLoadingUtils) {
  let { db, dbHelpers, ...rest } = relationshipLoadingUtils;
  let relationships = typeMetadata.relationships || {};

  for (let k of Object.keys(relationships)) {
    let relationship = relationships[k];
    let fkType = typeMetadata.fields[relationship.fkField];
    if (relationship.__isArray && !relationship.oneToMany) {
      if (updatesObject[`${k}_ADD`]) {
        let newObjectCandidates = await Promise.all(
          updatesObject[`${k}_ADD`].map(o => newObjectFromArgs(o, relationship.type, relationshipLoadingUtils))
        );
        let newObjects = await dbHelpers.processInsertions(db, newObjectCandidates, { typeMetadata: relationship.type, ...rest });

        if (!updatesObject[`${relationship.fkField}_ADDTOSET`]) {
          updatesObject[`${relationship.fkField}_ADDTOSET`] = [];
        }
        updatesObject[`${relationship.fkField}_ADDTOSET`].push(...newObjects.map(o => (fkType == StringArrayType ? "" + o._id : o._id)));
      }
    } else if (relationship.__isObject) {
      if (updatesObject[`${k}_SET`]) {
        let newObjectCandidate = await Promise.resolve(newObjectFromArgs(updatesObject[`${k}_SET`], relationship.type, relationshipLoadingUtils));
        let newObject = await dbHelpers.processInsertion(db, newObjectCandidate, { typeMetadata: relationship.type, ...rest });
        if (newObject) {
          updatesObject[relationship.fkField] = fkType == StringType ? "" + newObject._id : newObject._id;
        }
      }
    }
  }

  for (let k of Object.keys(updatesObject)) {
    let field = typeMetadata.fields[k];

    if (!field) {
      let pieces = k.split("_");
      let queryOperation = pieces.slice(-1)[0];
      let fieldName = pieces.slice(0, pieces.length - 1).join("_");
      field = typeMetadata.fields[fieldName];

      if (queryOperation === "INC") {
        $inc[prefix + fieldName] = updatesObject[k];
      } else if (queryOperation === "DEC") {
        $inc[prefix + fieldName] = updatesObject[k] * -1;
      } else if (queryOperation === "PUSH") {
        if (field === StringArrayType || field === IntArrayType || field == FloatArrayType) {
          $push[prefix + fieldName] = { $each: [updatesObject[k]] };
        } else {
          let toAdd = await newObjectFromArgs(updatesObject[k], field.type, relationshipLoadingUtils);
          $push[prefix + fieldName] = { $each: [toAdd] };
        }
      } else if (queryOperation === "CONCAT") {
        if (!$push[prefix + fieldName]) {
          $push[prefix + fieldName] = { $each: [] };
        }
        if (field === StringArrayType || field === IntArrayType || field == FloatArrayType) {
          $push[prefix + fieldName].$each.push(...updatesObject[k]);
        } else {
          let toAdd = await Promise.all(updatesObject[k].map(argsItem => newObjectFromArgs(argsItem, field.type, relationshipLoadingUtils)));
          $push[prefix + fieldName].$each.push(...toAdd);
        }
      } else if (queryOperation === "UPDATE") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          $set[prefix + `${fieldName}.${updatesObject[k].index}`] =
            field === MongoIdArrayType ? ObjectId(updatesObject[k].value) : updatesObject[k].value;
        } else if (field.__isArray) {
          await getUpdateObjectContents(
            updatesObject[k].Updates,
            field.type,
            prefix + `${fieldName}.${updatesObject[k].index}.`,
            $set,
            $inc,
            $push,
            $pull,
            $addToSet,
            relationshipLoadingUtils
          );
        } else {
          await getUpdateObjectContents(
            updatesObject[k],
            field.type,
            prefix + `${fieldName}.`,
            $set,
            $inc,
            $push,
            $pull,
            $addToSet,
            relationshipLoadingUtils
          );
        }
      } else if (queryOperation === "UPDATES") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          updatesObject[k].forEach(update => {
            $set[prefix + `${fieldName}.${update.index}`] = field === MongoIdArrayType ? ObjectId(update.value) : update.value;
          });
        } else {
          for (let update of updatesObject[k]) {
            await getUpdateObjectContents(
              update.Updates,
              field.type,
              prefix + `${fieldName}.${update.index}.`,
              $set,
              $inc,
              $push,
              $pull,
              $addToSet,
              relationshipLoadingUtils
            );
          }
        }
      } else if (queryOperation === "PULL") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          $pull[prefix + fieldName] = { $in: field === MongoIdArrayType ? updatesObject[k].map(val => ObjectId(val)) : updatesObject[k] };
        } else {
          $pull[prefix + fieldName] = fillMongoFiltersObject(updatesObject[k], field.type);
        }
      } else if (queryOperation === "ADDTOSET") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          $addToSet[prefix + fieldName] = { $each: field === MongoIdArrayType ? updatesObject[k].map(val => ObjectId(val)) : updatesObject[k] };
        }
      }
    } else {
      if (field == DateType || (typeof field === "object" && field.__isDate)) {
        $set[prefix + k] = new Date(updatesObject[k]);
      } else if (field.__isArray) {
        $set[prefix + k] = await Promise.all(updatesObject[k].map(argsItem => newObjectFromArgs(argsItem, field.type, relationshipLoadingUtils)));
      } else if (field.__isObject) {
        $set[prefix + k] = await newObjectFromArgs(updatesObject[k], field.type, relationshipLoadingUtils);
      } else {
        if (field === MongoIdArrayType) {
          $set[prefix + k] = updatesObject[k].map(item => ObjectId(item));
        } else if (field === MongoIdType) {
          $set[prefix + k] = ObjectId(updatesObject[k]);
        } else {
          $set[prefix + k] = updatesObject[k];
        }
      }
    }
  }
}

async function insertObjects(objArray, argsArray, typeMetadata, options) {
  let { db, ...rest } = options;
  let argsMap = new Map(objArray.map((o, i) => [o, argsArray[i]]));
  let newObjects = await processInsertions(db, objArray, { ...rest, typeMetadata });

  await Promise.all(newObjects.map(o => setUpOneToManyRelationships(o, argsMap.get(o), typeMetadata, { db, ...rest })));

  return newObjects;
}

async function handleInsertion(obj, args, typeMetadata, options) {
  let { db, ...rest } = options;
  let newObject = await processInsertion(db, obj, { ...rest, typeMetadata });
  if (newObject) {
    await setUpOneToManyRelationships(obj, args, typeMetadata, { db, ...rest });
  }
  return newObject;
}

export const constants = {
  useCurrentSelectionSet: Symbol("useCurrentSelectionSet")
};

export function cleanUpResults(results, metaData) {
  let mongoIdFields = Object.entries(metaData.fields)
    .filter(([k, field]) => field === MongoIdType)
    .map(([k]) => k);

  let mongoIdArrayFields = Object.entries(metaData.fields)
    .filter(([k, field]) => field === MongoIdArrayType)
    .map(([k]) => k);

  let objectFields = Object.entries(metaData.fields).filter(([k, field]) => field.type);

  results.forEach(obj => {
    if (!obj) {
      return;
    }
    mongoIdFields.forEach(f => {
      if (obj.hasOwnProperty(f)) {
        obj[f] = "" + obj[f];
      }
    });

    mongoIdArrayFields.forEach(f => {
      if (obj.hasOwnProperty(f)) {
        obj[f] = obj[f].map(o => o + "");
      }
    });

    objectFields.forEach(([k, field]) => {
      if (obj.hasOwnProperty(k)) {
        if (Array.isArray(obj[k])) {
          cleanUpResults(obj[k], field.type);
        } else {
          cleanUpResults([obj[k]], field.type);
        }
      }
    });
  });
}
