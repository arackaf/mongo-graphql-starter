    async create${objName}(root, args, context, ast) {
      let db = await root.db;
      context.__mongodb = db;
      let newObject = newObjectFromArgs(args.${objName}, ${objName}Metadata);
      let requestMap = parseRequestedFields(ast, "${objName}");
      let $project = requestMap.size ? getMongoProjection(requestMap, ${objName}Metadata, args) : null;

      if ((newObject = await dbHelpers.processInsertion(db, newObject, { typeMetadata: ${objName}Metadata, hooksObj, root, args, context, ast })) == null) {
        return { ${objName}: null };
      }
      let result = $project ? (await load${objName}s(db, { $match: { _id: newObject._id }, $project, $limit: 1 }))[0] : null;
      return {
        success: true,
        ${objName}: result
      }
    }