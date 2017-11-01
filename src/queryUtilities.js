import { MongoIdType, DateType, StringType, StringArrayType, IntArrayType, IntType, FloatType } from "./dataTypes";
import { ObjectId } from "mongodb";

export function getMongoProjection(requestMap, objectMetaData, args) {
  return getProjectionObject(requestMap, objectMetaData, args);
}
function getProjectionObject(requestMap, objectMetaData, args = {}, currentObject = "", increment = 0) {
  return [...requestMap.entries()].reduce((hash, [field, selectionEntry]) => {
    let entry = objectMetaData.fields[field];

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
          in: getProjectionObject(selectionEntry, entry.type, {}, "$$" + currentObjName, increment + 1)
        }
      };
    } else {
      hash[field] = getProjectionObject(selectionEntry, entry.type, {}, currentObject ? currentObject + "." + field : "$" + field, increment);
    }
    return hash;
  }, {});
}

export function getMongoFilters(args, objectMetaData) {
  return fillMongoFiltersObject(args, objectMetaData);
}
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
        hash[fieldName] = { $in: args[k] };
      } else {
        if (field === StringType) {
          if (queryOperation === "contains") {
            hash[fieldName] = { $regex: new RegExp(args[k], "i") };
          } else if (queryOperation === "startsWith") {
            hash[fieldName] = { $regex: new RegExp("^" + args[k], "i") };
          } else if (queryOperation === "endsWith") {
            hash[fieldName] = { $regex: new RegExp(args[k] + "$", "i") };
          }
        } else if (field === StringArrayType || field === IntArrayType) {
          if (queryOperation == "contains") {
            hash[fieldName] = args[k];
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
  let fieldNode = ast.fieldNodes.find(fn => fn.kind == "Field");

  if (queryName) {
    fieldNode = fieldNode.selectionSet.selections.find(fn => fn.kind == "Field" && fn.name && fn.name.value == queryName);
  }

  if (fieldNode) {
    return getSelections(fieldNode);
  } else {
    return new Map();
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
    } else {
      obj[k] = args[k];
    }

    return obj;
  }, {});
}

export function decontructGraphqlQuery(args, ast, objectMetaData, queryName) {
  let $match = getMongoFilters(args, objectMetaData);
  let requestMap = parseRequestedFields(ast, queryName);
  let metadataRequested = parseRequestedFields(ast, "Meta");
  let $project = null;
  if (requestMap.size) {
    $project = getMongoProjection(requestMap, objectMetaData, args);
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

  return { $match, $project, $sort, $limit, $skip, metadataRequested };
}

export function getUpdateObject(args, typeMetadata) {
  let $set = {};
  let $inc = {};
  let $push = {};
  getUpdateObjectContents(args, typeMetadata, "", $set, $inc, $push);
  let result = { $set, $inc, $push };
  Object.keys(result).forEach(k => {
    if (!Object.keys(result[k]).length) {
      delete result[k];
    }
  });
  return result;
}

function getUpdateObjectContents(args, typeMetadata, prefix, $set, $inc, $push) {
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
        if (field === StringArrayType || field === IntArrayType) {
          $push[prefix + fieldName] = args[k];
        } else {
          $push[prefix + fieldName] = newObjectFromArgs(args[k], field.type);
        }
      } else if (queryOperation === "CONCAT") {
        if (field === StringArrayType || field === IntArrayType) {
          $push[prefix + fieldName] = { $each: args[k] };
        } else {
          $push[prefix + fieldName] = { $each: args[k].map(argsItem => newObjectFromArgs(argsItem, field.type)) };
        }
      } else if (queryOperation === "UPDATE") {
        if (field.__isArray) {
          getUpdateObjectContents(args[k][field.type.typeName], field.type, prefix + `${fieldName}.${args[k].index}.`, $set, $inc, $push);
        } else {
          getUpdateObjectContents(args[k], field.type, prefix + `${fieldName}.`, $set, $inc, $push);
        }
      } else if (queryOperation === "UPDATES") {
        args[k].forEach(update => {
          getUpdateObjectContents(update[field.type.typeName], field.type, prefix + `${fieldName}.${update.index}.`, $set, $inc, $push);
        });
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
