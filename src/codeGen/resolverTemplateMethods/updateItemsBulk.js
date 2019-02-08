import { mutationStart, mutationError, mutationOver, mutationMeta, mutationComplete } from "../mutationHelpers";

export default ({ objName, table }) => `    async update${objName}sBulk(root, args, context, ast) {
      ${mutationStart({ objName, op: "update" })}
      return await resolverHelpers.runMutation(session, transaction, async() => {
        let { $match } = decontructGraphqlQuery(args.Match, ast, ${objName}Metadata);
        let updates = await getUpdateObject(args.Updates || {}, ${objName}Metadata, { ...gqlPacket, db, session });

        if (await runHook("beforeUpdate", $match, updates, { ...gqlPacket, db, session }) === false) {
          return { success: true };
        }
        await dbHelpers.runUpdate(db, "${table}", $match, updates, { session });
        await runHook("afterUpdate", $match, updates, { ...gqlPacket, db, session });

        return await resolverHelpers.finishSuccessfulMutation(session, transaction);
      });
    }`;
