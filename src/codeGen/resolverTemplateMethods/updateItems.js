import { mutationStart, mutationError, mutationOver, mutationMeta, mutationComplete } from "../mutationHelpers";

export default ({ objName, table }) => `    async update${objName}s(root, args, context, ast) {
      ${mutationStart({ objName, op: "update" })}
      try {
        let { $match, $project } = decontructGraphqlQuery({ _id_in: args._ids }, ast, ${objName}Metadata, "${objName}s");
        let updates = await getUpdateObject(args.Updates || {}, ${objName}Metadata, { ...gqlPacket, db, dbHelpers, hooksObj, session });

        if (await processHook(hooksObj, "${objName}", "beforeUpdate", $match, updates, { ...gqlPacket, db, session }) === false) {
          return { success: true };
        }
        await setUpOneToManyRelationshipsForUpdate(args._ids, args, ${objName}Metadata, { ...gqlPacket, db, dbHelpers, hooksObj, session });
        await dbHelpers.runUpdate(db, "${table}", $match, updates, { session, multi: true });
        await processHook(hooksObj, "${objName}", "afterUpdate", $match, updates, { ...gqlPacket, db, session });
        ${mutationComplete()}
        
        let result = $project ? await load${objName}s(db, { $match, $project }, root, args, context, ast) : null;
        return {
          ${objName}s: result,
          success: true,
          ${mutationMeta()}
        };
      } ${mutationError()} ${mutationOver()}
    }`;
