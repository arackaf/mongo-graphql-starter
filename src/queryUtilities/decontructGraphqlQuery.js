import { getMongoFilters, getMongoProjection } from "./mongoQueryHelpers";
import { parseRequestedFields } from "./parseAst";

export default function(args, ast, objectMetaData) {
  let $match = getMongoFilters(args, objectMetaData),
    { primitives: requestedFields } = parseRequestedFields(ast),
    $project = getMongoProjection(requestedFields),
    sort = args.SORT,
    sorts = args.SORTS,
    $sort;

  if (sort) {
    $sort = sort;
  } else if (sorts) {
    $sort = {};
    sorts.forEach(packet => {
      Object.assign($sort, packet);
    });
  }

  return { $match, requestedFields, $project, $sort };
}
