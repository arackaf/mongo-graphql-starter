import { MongoIdType, MongoIdArrayType, StringType, StringArrayType, IntArrayType, IntType, FloatType, FloatArrayType } from "./dataTypes";
import { ObjectId } from "mongodb";
import { processInsertions } from "./dbHelpers";

import escapeStringRegexp from "escape-string-regexp";
import { newObjectFromArgs, insertObjects } from "./insertUtilities";
import { parseRequestedFields, parseRequestedHierarchy } from "./projectUtilities";

export function getMongoFilters(args, objectMetaData) {
  return fillMongoFiltersObject(args, objectMetaData);
}
const numberArrayOperations = new Set(["lt", "lte", "gt", "gte"]);
const numberArrayEmOperations = new Set(["emlt", "emlte", "emgt", "emgte"]);
const stringOps = new Set(["contains", "startsWith", "endsWith", "regex"]);
const stringArrayOps = new Set(["textContains", "startsWith", "endsWith", "regex"]);

export function fillMongoFiltersObject(args, objectMetaData, hash = {}, prefix = "") {
  let fields = objectMetaData.fields;
  Object.keys(args).forEach(k => {
    if (k === "OR" && args.OR != null) {
      if (!Array.isArray(args.OR)) {
        throw "Non array passed to OR - received " + hash.OR;
      }
      hash.$or = args.OR.map(packetArgs => fillMongoFiltersObject(packetArgs, objectMetaData, void 0, prefix));
    } else if (fields[k]) {
      if (typeof fields[k] === "object" && fields[k].__isDate) {
        if (args[k] === null) {
          hash[k] = null;
        } else {
          args[k] = new Date(args[k]);
        }
      } else if (fields[k].__isObject) {
        if (args[k] === null) {
          hash[prefix + k] = null;
        } else {
          fillMongoFiltersObject(args[k], fields[k].type, hash, prefix + k + ".");
        }
        return;
      } else if (fields[k].__isArray) {
        if (args[k] === null) {
          hash[prefix + k] = null;
        } else {
          hash[prefix + k] = { $elemMatch: fillMongoFiltersObject(args[k], fields[k].type) };
        }
        return;
      } else if (fields[k] === MongoIdType) {
        if (args[k] === null) {
          hash[prefix + k] = null;
        } else {
          args[k] = ObjectId(args[k]);
        }
      } else if (fields[k] === MongoIdArrayType) {
        if (args[k] === null) {
          hash[prefix + k] = null;
        } else {
          args[k] = args[k].map(val => ObjectId(val));
        }
      }

      hash[prefix + k] = args[k];
    } else if (k.indexOf("_") >= 0) {
      let pieces = k.split("_");
      let queryOperation = pieces.slice(-1)[0];
      let fieldName = pieces.slice(0, pieces.length - 1).join("_");
      let field = objectMetaData.fields[fieldName];
      fieldName = prefix + fieldName;
      let isDate = typeof field === "object" && field.__isDate;

      if (args[k] == null && queryOperation !== "ne") {
        return;
      }

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

export function decontructGraphqlQuery(args, ast, objectMetaData, queryName, options = {}) {
  let $match = getMongoFilters(args, objectMetaData);
  let requestMap = parseRequestedFields(ast, queryName, options.force || []);
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
