import { getMongoFilters, getMongoProjection } from "./mongoQueryHelpers";
import { parseRequestedFields } from "./parseAst";

export default function(args, ast, objectMetaData) {
  let filters = getMongoFilters(args, objectMetaData),
    { primitives: requestedFields } = parseRequestedFields(ast),
    projections = getMongoProjection(requestedFields);

  return { filters, requestedFields, projections };
}
