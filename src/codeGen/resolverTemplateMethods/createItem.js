import { getDbObjects, mutationComplete, mutationError, mutationOver } from "../mutationHelpers";

export default ({ objName }) =>
  `    async create${objName}(root, args, context, ast) {
      ${getDbObjects()}
      try {
        let newObject = await newObjectFromArgs(args.${objName}, ${objName}Metadata, { db, dbHelpers, hooksObj, root, args, context, ast });
        let requestMap = parseRequestedFields(ast, "${objName}");
        let $project = requestMap.size ? getMongoProjection(requestMap, ${objName}Metadata, args) : null;

        newObject = await dbHelpers.processInsertion(db, newObject, { typeMetadata: ${objName}Metadata, hooksObj, root, args, context, ast, session });
        if (newObject == null) {
          return { ${objName}: null };
        }
        await setUpOneToManyRelationships(newObject, args.${objName}, ${objName}Metadata, { db, hooksObj, root, args, context, ast });
        ${mutationComplete()}

        let result = $project ? (await load${objName}s(db, { $match: { _id: newObject._id }, $project, $limit: 1 }, root, args, context, ast))[0] : null;
        return {
          success: true,
          ${objName}: result
        }
      } ${mutationError()} ${mutationOver()}
    }`;
