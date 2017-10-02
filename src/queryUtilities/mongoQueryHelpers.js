import { parseRequestedFields } from "./parseAst";
import { MongoId, String, Int, Float } from "../createGraphqlSchema/dataTypes";

export function getMongoProjection(fields) {
  return fields.reduce((hash, field) => ((hash[field] = 1), hash), {});
}

export function getMongoFilters(args, objectMetaData) {
  return Object.keys(args).reduce((hash, k) => {
    if (objectMetaData.fields[k]) {
      hash[k] = args[k];
    } else if (k.indexOf("_") >= 0) {
      let pieces = k.split("_"),
        queryOperation = pieces.slice(-1)[0],
        fieldName = pieces.slice(0, pieces.length - 1).join("_");

      let field = objectMetaData.fields[fieldName];
      if (field === String) {
        if (queryOperation === "contains") {
          hash[fieldName] = { $regex: new RegExp(args[k], "i") };
        } else if (queryOperation === "startsWith") {
          hash[fieldName] = { $regex: new RegExp("^" + args[k], "i") };
        } else if (queryOperation === "endsWith") {
          hash[fieldName] = { $regex: new RegExp(args[k] + "$", "i") };
        }
      } else if (field === Int || field === Float) {
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
    return hash;
  }, {});
}
