import { mutationStart, mutationComplete, mutationError, mutationOver, mutationMeta } from "../mutationHelpers";

export default ({ objName }) =>
  `    async create${objName}(root, args, context, ast) {
      ${mutationStart({ objName, op: "create" })}
      return await resolverHelpers.runMutation(session, transaction, async() => {
        let newObject = await newObjectFromArgs(args.${objName}, ${objName}Metadata, { ...gqlPacket, db, session });
        let requestMap = parseRequestedFields(ast, "${objName}");
        let $project = requestMap.size ? getMongoProjection(requestMap, ${objName}Metadata, args) : null;

        newObject = await dbHelpers.processInsertion(db, newObject, { ...gqlPacket, typeMetadata: ${objName}Metadata, session });
        if (newObject == null) {
          return { ${objName}: null };
        }
        await setUpOneToManyRelationships(newObject, args.${objName}, ${objName}Metadata, { ...gqlPacket, db, session });
        ${mutationComplete()}

        let result = $project ? (await load${objName}s(db, { $match: { _id: newObject._id }, $project, $limit: 1 }, root, args, context, ast))[0] : null;
        return resolverHelpers.mutationSuccessResult({ ${objName}: result, transaction, elapsedTime: 0 });
      });
    }`;
