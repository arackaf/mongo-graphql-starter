import { MongoIdType, DateType, StringType, IntType, FloatType } from "./createGraphqlSchema/dataTypes";
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
  let fields = objectMetaData.fields;
  return Object.keys(args).reduce((hash, k) => {
    if (k === "OR" && args.OR != null) {
      if (!Array.isArray(args.OR)) {
        throw "Non array passed to OR - received " + hash.OR;
      }
      hash.$or = args.OR.map(packetArgs => getMongoFilters(packetArgs, objectMetaData));
    } else if (fields[k]) {
      if (typeof fields[k] === "object" && fields[k].__isDate) {
        args[k] = new Date(args[k]);
      } else if (fields[k] === MongoIdType) {
        args[k] = ObjectId(args[k]);
      }

      hash[k] = args[k];
    } else if (k.indexOf("_") >= 0) {
      let pieces = k.split("_");
      let queryOperation = pieces.slice(-1)[0];
      let fieldName = pieces.slice(0, pieces.length - 1).join("_");
      let field = objectMetaData.fields[fieldName];
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
    return hash;
  }, {});
}

export function parseRequestedFields(ast) {
  let fieldNode = ast.fieldNodes.find(fn => fn.kind == "Field");
  if (fieldNode) {
    return getSelections(fieldNode);
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

export function decontructGraphqlQuery(args, ast, objectMetaData) {
  let $match = getMongoFilters(args, objectMetaData);
  let requestMap = parseRequestedFields(ast);
  let $project = getMongoProjection(requestMap, objectMetaData, args);
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

  return { $match, $project, $sort, $limit, $skip };
}

export function getUpdateObject(args, typeMetadata) {
  let $set = {};
  let $inc = {};
  getUpdateObjectContents(args, typeMetadata, $set, $inc);
  let result = { $set, $inc };
  Object.keys(result).forEach(k => {
    if (!Object.keys(result[k]).length) {
      delete result[k];
    }
  });
  return result;
}

function getUpdateObjectContents(args, typeMetadata, $set, $inc) {
  Object.keys(args).forEach(k => {
    let field = typeMetadata.fields[k];

    if (!field) {
      let pieces = k.split("_");
      let queryOperation = pieces.slice(-1)[0];
      let fieldName = pieces.slice(0, pieces.length - 1).join("_");

      if (queryOperation === "INC") {
        $inc[fieldName] = args[k];
      } else if (queryOperation === "DEC") {
        $inc[fieldName] = args[k] * -1;
      }
    } else {
      if (field == DateType || (typeof field === "object" && field.__isDate)) {
        $set[k] = new Date(args[k]);
      } else if (field.__isArray) {
        $set[k] = args[k].map(argsItem => getUpdateObjectContents(argsItem, field.type, {}, $inc));
      } else if (field.__isObject) {
        $set[k] = getUpdateObjectContents(args[k], field.type, {}, $inc);
      } else {
        $set[k] = args[k];
      }
    }
  });
  return $set; //ugh this is ugly
}
