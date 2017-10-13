import { getMongoFilters, getMongoProjection } from "./mongoQueryHelpers";
import { parseRequestedFields } from "./parseAst";

export default function(args, ast, objectMetaData) {
  let $match = getMongoFilters(args, objectMetaData),
    { primitives: requestedFields } = parseRequestedFields(ast),
    $project = getMongoProjection(requestedFields),
    sort = args.SORT,
    sorts = args.SORTS,
    $sort,
    $limit,
    $skip;

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

  return { $match, requestedFields, $project, $sort, $limit, $skip };
}
