import { getMongoFilters, getMongoProjection } from "./mongoQueryHelpers";
import { parseRequestedFields } from "./parseAst";

export default function(args, ast, objectMetaData) {
  let $match = getMongoFilters(args, objectMetaData),
    { primitives: requestedFields } = parseRequestedFields(ast),
    $project = getMongoProjection(requestedFields),
    $sort = args.SORT;

  return { $match, requestedFields, $project, $sort };
}
