import { getDbObjects, mutationError, mutationOver, mutationMeta, mutationComplete } from "../mutationHelpers";

export default ({ objName, table }) => `    async update${objName}sBulk(root, args, context, ast) {
      ${getDbObjects({ objName, op: "update" })}
      try {
        let { $match } = decontructGraphqlQuery(args.Match, ast, ${objName}Metadata);
        let updates = await getUpdateObject(args.Updates || {}, ${objName}Metadata, { db, dbHelpers, hooksObj, root, args, context, ast, session });

        if (await processHook(hooksObj, "${objName}", "beforeUpdate", $match, updates, { db, root, args, context, ast, session }) === false) {
          return { success: true };
        }
        await dbHelpers.runUpdate(db, "${table}", $match, updates, { session, multi: true });
        await processHook(hooksObj, "${objName}", "afterUpdate", $match, updates, { db, root, args, context, ast, session });
        ${mutationComplete()}

        return { 
          success: true,
          ${mutationMeta()}
        };
      } ${mutationError()} ${mutationOver()}
    }`;
