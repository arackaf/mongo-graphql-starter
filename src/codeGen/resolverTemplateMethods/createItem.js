    async create${objName}(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.${objName}, ${objName}Metadata);
      let requestMap = parseRequestedFields(ast, "${objName}");
      let $project = requestMap.size ? getMongoProjection(requestMap, ${objName}Metadata, args) : null;

      if (await processHook(hooksObj, "${objName}", "beforeInsert", newObject, root, args, context, ast) === false) {
        return { ${objName}: null };
      }
      await dbHelpers.runInsert(db, "${table}", newObject);
      await processHook(hooksObj, "${objName}", "afterInsert", newObject, root, args, context, ast);

      let result = $project ? (await load${objName}s(db, { $match: { _id: newObject._id }, $project, $limit: 1 }))[0] : null;
      return {
        success: true,
        ${objName}: result
      }
    }