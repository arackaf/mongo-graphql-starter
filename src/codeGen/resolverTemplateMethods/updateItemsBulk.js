import { mutationStart, mutationError, mutationOver, mutationMeta, mutationComplete } from "../mutationHelpers";

export default ({ objName, table }) => `    async update${objName}sBulk(root, args, context, ast) {
      ${mutationStart({ objName, op: "update" })}
      try {
        let { $match } = decontructGraphqlQuery(args.Match, ast, ${objName}Metadata);
        let updates = await getUpdateObject(args.Updates || {}, ${objName}Metadata, { ...gqlPacket, db, dbHelpers, hooksObj, session });

        if (await processHook(hooksObj, "${objName}", "beforeUpdate", $match, updates, { ...gqlPacket, db, session }) === false) {
          return { success: true };
        }
        await dbHelpers.runUpdate(db, "${table}", $match, updates, { session, multi: true });
        await processHook(hooksObj, "${objName}", "afterUpdate", $match, updates, { ...gqlPacket, db, session });
        ${mutationComplete()}

        return { 
          success: true,
          ${mutationMeta()}
        };
      } ${mutationError()} ${mutationOver()}
    }`;
