import { MongoIdType, MongoIdArrayType, DateType, StringType, StringArrayType, IntArrayType, IntType, FloatType, FloatArrayType } from "./dataTypes";
import { ObjectId } from "mongodb";

export function getMongoProjection(requestMap, objectMetaData, args, extrasPackets) {
  return getProjectionObject(requestMap, objectMetaData, args, extrasPackets);
}
function getProjectionObject(requestMap, objectMetaData, args = {}, extrasPackets, currentObject = "", increment = 0) {
  let result = [...requestMap.entries()].reduce((hash, [field, selectionEntry]) => {
    let entry = objectMetaData.fields[field];
    if (!entry) {
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

  if (extrasPackets && extrasPackets.size && objectMetaData.relationships) {
    Object.keys(objectMetaData.relationships).forEach(relationshipName => {
      let relationship = objectMetaData.relationships[relationshipName];
      if (extrasPackets.get(relationshipName)) {
        result[relationship.fkField] = 1;
      }
    });
  }

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
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp(args[k], "i")));
          } else if (queryOperation === "startsWith") {
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp("^" + args[k], "i")));
          } else if (queryOperation === "endsWith") {
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp(args[k] + "$", "i")));
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
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp(args[k], "i")));
          } else if (queryOperation === "startsWith") {
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp("^" + args[k], "i")));
          } else if (queryOperation === "endsWith") {
            ensure(hash, fieldName, () => (hash[fieldName].$regex = new RegExp(args[k] + "$", "i")));
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

export function parseRequestedFields(ast, queryName) {
  let { requestMap } = getNestedQueryInfo(ast, queryName);
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

export function newObjectFromArgs(args, typeMetadata) {
  return Object.keys(args).reduce((obj, k) => {
    let field = typeMetadata.fields[k];
    if (!field) return obj;

    if (field == DateType || field.__isDate) {
      obj[k] = new Date(args[k]);
    } else if (field.__isArray) {
      obj[k] = args[k].map(argItem => newObjectFromArgs(argItem, field.type));
    } else if (field.__isObject) {
      obj[k] = newObjectFromArgs(args[k], field.type);
    } else if (field === MongoIdArrayType) {
      obj[k] = args[k].map(val => ObjectId(val));
    } else if (field === MongoIdType) {
      obj[k] = ObjectId(args[k]);
    } else {
      obj[k] = args[k];
    }

    return obj;
  }, {});
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

export function decontructGraphqlQuery(args, ast, objectMetaData, queryName) {
  let $match = getMongoFilters(args, objectMetaData);
  let requestMap, metadataRequested, $project, extrasPackets;

  if (ast && queryName) {
    requestMap = parseRequestedFields(ast, queryName);
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

export async function getUpdateObject(updatesObject, typeMetadata, { db, dbHelpers } = {}) {
  let $set = {};
  let $inc = {};
  let $push = {};
  let $pull = {};
  let $addToSet = {};

  let relationships = typeMetadata.relationships || {};
  for (let k of Object.keys(relationships)) {
    let relationship = relationships[k];
    if (relationship.__isArray) {
      if (updatesObject[`${k}_ADD`]) {
        let newObjects = updatesObject[`${k}_ADD`].map(o => newObjectFromArgs(o, relationship.type));
        newObjects = await dbHelpers.runMultipleInserts(db, relationship.type.table, newObjects);

        if (!updatesObject[`${relationship.fkField}_ADDTOSET`]) {
          updatesObject[`${relationship.fkField}_ADDTOSET`] = [];
        }
        updatesObject[`${relationship.fkField}_ADDTOSET`].push(...newObjects.map(o => "" + o._id));
      }
    }
  }

  getUpdateObjectContents(updatesObject, typeMetadata, "", $set, $inc, $push, $pull, $addToSet);
  let result = { $set, $inc, $push, $pull, $addToSet };
  Object.keys(result).forEach(k => {
    if (!Object.keys(result[k]).length) {
      delete result[k];
    }
  });
  return result;
}

function getUpdateObjectContents(updatesObject, typeMetadata, prefix, $set, $inc, $push, $pull, $addToSet) {
  Object.keys(updatesObject).forEach(k => {
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
          $push[prefix + fieldName] = { $each: [newObjectFromArgs(updatesObject[k], field.type)] };
        }
      } else if (queryOperation === "CONCAT") {
        if (!$push[prefix + fieldName]) {
          $push[prefix + fieldName] = { $each: [] };
        }
        if (field === StringArrayType || field === IntArrayType || field == FloatArrayType) {
          $push[prefix + fieldName].$each.push(...updatesObject[k]);
        } else {
          $push[prefix + fieldName].$each.push(...updatesObject[k].map(argsItem => newObjectFromArgs(argsItem, field.type)));
        }
      } else if (queryOperation === "UPDATE") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          $set[prefix + `${fieldName}.${updatesObject[k].index}`] =
            field === MongoIdArrayType ? ObjectId(updatesObject[k].value) : updatesObject[k].value;
        } else if (field.__isArray) {
          getUpdateObjectContents(
            updatesObject[k].Updates,
            field.type,
            prefix + `${fieldName}.${updatesObject[k].index}.`,
            $set,
            $inc,
            $push,
            $pull,
            $addToSet
          );
        } else {
          getUpdateObjectContents(updatesObject[k], field.type, prefix + `${fieldName}.`, $set, $inc, $push, $pull, $addToSet);
        }
      } else if (queryOperation === "UPDATES") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          updatesObject[k].forEach(update => {
            $set[prefix + `${fieldName}.${update.index}`] = field === MongoIdArrayType ? ObjectId(update.value) : update.value;
          });
        } else {
          updatesObject[k].forEach(update => {
            getUpdateObjectContents(update.Updates, field.type, prefix + `${fieldName}.${update.index}.`, $set, $inc, $push, $pull, $addToSet);
          });
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
        $set[prefix + k] = updatesObject[k].map(argsItem => newObjectFromArgs(argsItem, field.type));
      } else if (field.__isObject) {
        $set[prefix + k] = newObjectFromArgs(updatesObject[k], field.type);
      } else {
        $set[prefix + k] = updatesObject[k];
      }
    }
  });
}

export const constants = {
  useCurrentSelectionSet: Symbol("useCurrentSelectionSet")
};
