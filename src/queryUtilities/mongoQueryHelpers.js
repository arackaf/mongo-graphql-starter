import { parseRequestedFields } from "./parseAst";
import { MongoId, String, Int, Float } from "../createGraphqlSchema/dataTypes";

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
  return Object.keys(args).reduce((hash, k) => {
    if (k === "OR" && args.OR != null) {
      if (!Array.isArray(args.OR)) {
        throw "Non array passed to OR - received " + hash.OR;
      }
      hash.$or = args.OR.map(packetArgs => getMongoFilters(packetArgs, objectMetaData));
    } else if (objectMetaData.fields[k]) {
      hash[k] = args[k];
    } else if (k.indexOf("_") >= 0) {
      let pieces = k.split("_"),
        queryOperation = pieces.slice(-1)[0],
        fieldName = pieces.slice(0, pieces.length - 1).join("_");

      let field = objectMetaData.fields[fieldName];

      if (queryOperation === "in") {
        hash[fieldName] = { $in: args[k] };
      } else {
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
    }
    return hash;
  }, {});
}
