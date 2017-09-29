import { parseRequestedFields } from "./parseAst";
import { MongoId, String, Int, Float } from "../createGraphqlSchema/dataTypes";

export function getMongoProjection(fields) {
  return fields.reduce((hash, field) => ((hash[field] = 1), hash), {});
}

export function getMongoFilters(args, objectMetaData) {
  return Object.keys(args).reduce((hash, k) => {
    if (objectMetaData.fields[k]) {
      hash[k] = args[k];
    }
    return hash;
  }, {});
}
