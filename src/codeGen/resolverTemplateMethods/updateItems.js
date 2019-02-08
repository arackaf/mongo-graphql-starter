import { getDbObjects, mutationError, mutationOver, mutationMeta, mutationComplete } from "../mutationHelpers";

export default ({ objName, table }) => `    async update${objName}s(root, args, context, ast) {
      ${getDbObjects({ objName, op: "update" })}
      try {
        let { $match, $project } = decontructGraphqlQuery({ _id_in: args._ids }, ast, ${objName}Metadata, "${objName}s");
        let updates = await getUpdateObject(args.Updates || {}, ${objName}Metadata, { db, dbHelpers, hooksObj, root, args, context, ast, session });

        if (await processHook(hooksObj, "${objName}", "beforeUpdate", $match, updates, { db, root, args, context, ast, session }) === false) {
          return { success: true };
        }
        await setUpOneToManyRelationshipsForUpdate(args._ids, args, ${objName}Metadata, { db, dbHelpers, hooksObj, root, args, context, ast, session });
        await dbHelpers.runUpdate(db, "${table}", $match, updates, { session, multi: true });
        await processHook(hooksObj, "${objName}", "afterUpdate", $match, updates, { db, root, args, context, ast, session });
        ${mutationComplete()}
        
        let result = $project ? await load${objName}s(db, { $match, $project }, root, args, context, ast) : null;
        return {
          ${objName}s: result,
          success: true,
          ${mutationMeta()}
        };
      } ${mutationError()} ${mutationOver()}
    }`;
