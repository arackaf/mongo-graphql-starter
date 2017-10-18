import { parseRequestedFields } from "./parseAst";
import { MongoIdType, StringType, IntType, FloatType } from "../createGraphqlSchema/dataTypes";

import { ObjectId } from "mongodb";

export function getMongoProjection(primitiveSelections, objectSelections, objectMetaData, args) {
  let result = primitiveSelections.reduce((hash, field) => {
    let entry = objectMetaData.fields[field];
    if (typeof entry === "object" && entry.__isDate) {
      let format = args[field + "_format"] || entry.format;
      hash[field] = { $dateToString: { format, date: "$" + field } };
    } else {
      hash[field] = 1;
    }
    return hash;
  }, {});
  objectSelections.forEach(sel => {
    if (objectMetaData.fields[sel]) {
      result[sel] = 1;
    }
  });
  return result;
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
