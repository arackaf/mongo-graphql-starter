import { parseRequestedFields } from "./parseAst";

export function getMongoProjection(fields) {
  return fields.reduce((hash, field) => ((hash[field] = 1), hash), {});
}
