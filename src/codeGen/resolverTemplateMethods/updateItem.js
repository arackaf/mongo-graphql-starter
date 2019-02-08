import { mutationStart, mutationError, mutationOver, mutationMeta, mutationComplete } from "../mutationHelpers";

export default ({ objName, table }) => `    async update${objName}(root, args, context, ast) {
      ${mutationStart({ objName, op: "update" })}
      try {
        let { $match, $project } = decontructGraphqlQuery(args._id ? { _id: args._id } : {}, ast, ${objName}Metadata, "${objName}");
        let updates = await getUpdateObject(args.Updates || {}, ${objName}Metadata, { ...gqlPacket, db, dbHelpers, hooksObj, session });

        if (await processHook(hooksObj, "${objName}", "beforeUpdate", $match, updates, { ...gqlPacket, db, session }) === false) {
          return { ${objName}: null };
        }
        if (!$match._id) {
          throw "No _id sent, or inserted in middleware";
        }
        await setUpOneToManyRelationshipsForUpdate([args._id], args, ${objName}Metadata, { ...gqlPacket, db, dbHelpers, hooksObj, session });
        await dbHelpers.runUpdate(db, "${table}", $match, updates, { session });
        await processHook(hooksObj, "${objName}", "afterUpdate", $match, updates, { ...gqlPacket, db, session });
        ${mutationComplete()}
        
        let result = $project ? (await load${objName}s(db, { $match, $project, $limit: 1 }, root, args, context, ast))[0] : null;
        
        return {
          ${objName}: result,
          success: true,
          ${mutationMeta()}
        };
      } ${mutationError()} ${mutationOver()}
    }`;
