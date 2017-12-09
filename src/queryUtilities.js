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

      if (queryOperation === "in") {
        if (field === MongoIdArrayType) {
          hash[fieldName] = { $in: args[k].map(arr => arr.map(val => ObjectId(val))) };
        } else {
          hash[fieldName] = { $in: args[k] };
        }
      } else if (queryOperation == "ne") {
        hash[fieldName] = { $ne: args[k] };
      } else {
        if (field === StringType) {
          if (queryOperation === "contains") {
            hash[fieldName] = { $regex: new RegExp(args[k], "i") };
          } else if (queryOperation === "startsWith") {
            hash[fieldName] = { $regex: new RegExp("^" + args[k], "i") };
          } else if (queryOperation === "endsWith") {
            hash[fieldName] = { $regex: new RegExp(args[k] + "$", "i") };
          }
        } else if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          if (!hash[fieldName]) {
            hash[fieldName] = {};
          }
          if (queryOperation == "contains") {
            if (!hash[fieldName].$in) {
              hash[fieldName].$in = [];
            }
            hash[fieldName].$in.push(field === MongoIdArrayType ? ObjectId(args[k]) : args[k]);
          } else if (queryOperation == "textcontains") {
            hash[fieldName].$regex = new RegExp(args[k], "i");
          } else if (numberArrayOperations.has(queryOperation)) {
            if (queryOperation === "lt") {
              hash[fieldName].$lt = args[k];
            } else if (queryOperation === "lte") {
              hash[fieldName].$lte = args[k];
            } else if (queryOperation === "gt") {
              hash[fieldName].$gt = args[k];
            } else if (queryOperation === "gte") {
              hash[fieldName].$gte = args[k];
            }
          } else if (numberArrayEmOperations.has(queryOperation)) {
            if (!hash[fieldName].$elemMatch) {
              hash[fieldName].$elemMatch = {};
            }
            if (queryOperation === "emlt") {
              hash[fieldName].$elemMatch.$lt = args[k];
            } else if (queryOperation === "emlte") {
              hash[fieldName].$lte = args[k];
              hash[fieldName].$elemMatch.$lte = args[k];
            } else if (queryOperation === "emgt") {
              hash[fieldName].$elemMatch.$gt = args[k];
            } else if (queryOperation === "emgte") {
              hash[fieldName].$elemMatch.$gte = args[k];
            }
          }
        } else if (field === IntType || field === FloatType || isDate) {
          if (queryOperation === "lt") {
            hash[fieldName] = { $lt: args[k] };
          } else if (queryOperation === "lte") {
            hash[fieldName] = { $lte: args[k] };
          } else if (queryOperation === "gt") {
            hash[fieldName] = { $gt: args[k] };
          } else if (queryOperation === "gte") {
            hash[fieldName] = { $gte: args[k] };
          }
        }
      }
    }
  });
  return hash;
}

export function parseRequestedFields(ast, queryName) {
  let { requestMap } = getNestedQueryInfo(ast, queryName);
  return requestMap;
}
export function getNestedQueryInfo(ast, queryName) {
  let fieldNode = ast.fieldNodes ? ast.fieldNodes.find(fn => fn.kind == "Field") : ast;

  if (queryName) {
    for (let path of queryName.split(".")) {
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
      let { ast: astNew, requestMap } = getNestedQueryInfo(ast, anchor ? anchor + "." + name : name);

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
  let requestMap = parseRequestedFields(ast, queryName);
  let metadataRequested = parseRequestedFields(ast, "Meta");
  let { $project, extrasPackets } = parseRequestedHierarchy(ast, requestMap, objectMetaData, args, queryName);
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

export function getUpdateObject(args, typeMetadata) {
  let $set = {};
  let $inc = {};
  let $push = {};
  let $pull = {};
  getUpdateObjectContents(args, typeMetadata, "", $set, $inc, $push, $pull);
  let result = { $set, $inc, $push, $pull };
  Object.keys(result).forEach(k => {
    if (!Object.keys(result[k]).length) {
      delete result[k];
    }
  });
  return result;
}

function getUpdateObjectContents(args, typeMetadata, prefix, $set, $inc, $push, $pull) {
  Object.keys(args).forEach(k => {
    let field = typeMetadata.fields[k];

    if (!field) {
      let pieces = k.split("_");
      let queryOperation = pieces.slice(-1)[0];
      let fieldName = pieces.slice(0, pieces.length - 1).join("_");
      field = typeMetadata.fields[fieldName];

      if (queryOperation === "INC") {
        $inc[prefix + fieldName] = args[k];
      } else if (queryOperation === "DEC") {
        $inc[prefix + fieldName] = args[k] * -1;
      } else if (queryOperation === "PUSH") {
        if (field === StringArrayType || field === IntArrayType || field == FloatArrayType) {
          $push[prefix + fieldName] = args[k];
        } else {
          $push[prefix + fieldName] = newObjectFromArgs(args[k], field.type);
        }
      } else if (queryOperation === "CONCAT") {
        if (field === StringArrayType || field === IntArrayType || field == FloatArrayType) {
          $push[prefix + fieldName] = { $each: args[k] };
        } else {
          $push[prefix + fieldName] = { $each: args[k].map(argsItem => newObjectFromArgs(argsItem, field.type)) };
        }
      } else if (queryOperation === "UPDATE") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          $set[prefix + `${fieldName}.${args[k].index}`] = field === MongoIdArrayType ? ObjectId(args[k].value) : args[k].value;
        } else if (field.__isArray) {
          getUpdateObjectContents(args[k][field.type.typeName], field.type, prefix + `${fieldName}.${args[k].index}.`, $set, $inc, $push, $pull);
        } else {
          getUpdateObjectContents(args[k], field.type, prefix + `${fieldName}.`, $set, $inc, $push, $pull);
        }
      } else if (queryOperation === "UPDATES") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          args[k].forEach(update => {
            $set[prefix + `${fieldName}.${update.index}`] = field === MongoIdArrayType ? ObjectId(update.value) : update.value;
          });
        } else {
          args[k].forEach(update => {
            getUpdateObjectContents(update[field.type.typeName], field.type, prefix + `${fieldName}.${update.index}.`, $set, $inc, $push, $pull);
          });
        }
      } else if (queryOperation === "PULL") {
        if (field === StringArrayType || field === IntArrayType || field === FloatArrayType || field === MongoIdArrayType) {
          $pull[prefix + fieldName] = { $in: field === MongoIdArrayType ? args[k].map(val => ObjectId(val)) : args[k] };
        } else {
          $pull[prefix + fieldName] = fillMongoFiltersObject(args[k], field.type);
        }
      }
    } else {
      if (field == DateType || (typeof field === "object" && field.__isDate)) {
        $set[prefix + k] = new Date(args[k]);
      } else if (field.__isArray) {
        $set[prefix + k] = args[k].map(argsItem => newObjectFromArgs(argsItem, field.type));
      } else if (field.__isObject) {
        $set[prefix + k] = newObjectFromArgs(args[k], field.type);
      } else {
        $set[prefix + k] = args[k];
      }
    }
  });
}
