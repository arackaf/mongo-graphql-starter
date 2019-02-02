import { getDbObjects, mutationError, mutationOver, mutationMeta } from "../mutationHelpers";

export default ({ objName, table }) => `    async update${objName}(root, args, context, ast) {
      ${getDbObjects({ objName, op: "update" })}
      try {
        let { $match, $project } = decontructGraphqlQuery(args._id ? { _id: args._id } : {}, ast, ${objName}Metadata, "${objName}");
        let updates = await getUpdateObject(args.Updates || {}, ${objName}Metadata, { db, dbHelpers, hooksObj, root, args, context, ast });

        if (await processHook(hooksObj, "${objName}", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
          return { ${objName}: null };
        }
        if (!$match._id) {
          throw "No _id sent, or inserted in middleware";
        }
        await setUpOneToManyRelationshipsForUpdate([args._id], args, ${objName}Metadata, { db, dbHelpers, hooksObj, root, args, context, ast, session });
        await dbHelpers.runUpdate(db, "${table}", $match, updates, { session });
        await processHook(hooksObj, "${objName}", "afterUpdate", $match, updates, root, args, context, ast);
        
        let result = $project ? (await load${objName}s(db, { $match, $project, $limit: 1 }, root, args, context, ast))[0] : null;
        return {
          ${objName}: result,
          success: true,
          ${mutationMeta()}
        };
      } ${mutationError()} ${mutationOver()}
    }`;
