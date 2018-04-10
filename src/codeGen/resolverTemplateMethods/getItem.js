    async get${objName}(root, args, context, ast) {
      await processHook(hooksObj, "${objName}", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, ${objName}Metadata, "${objName}");
      await processHook(hooksObj, "${objName}", "queryMiddleware", queryPacket, root, args, context, ast);
      let results = await load${objName}s(db, queryPacket);

      return {
        ${objName}: results[0] || null
      };
    }