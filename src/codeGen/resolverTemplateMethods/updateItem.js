    async update${objName}(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let db = await root.db;
      context.__mongodb = db;
      let { $match, $project } = decontructGraphqlQuery({ _id: args._id }, ast, ${objName}Metadata, "${objName}");
      let updates = await getUpdateObject(args.Updates || {}, ${objName}Metadata, { db, dbHelpers, hooksObj, root, args, context, ast });

      if (await processHook(hooksObj, "${objName}", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { ${objName}: null };
      }
      await dbHelpers.runUpdate(db, "${table}", $match, updates);
      await processHook(hooksObj, "${objName}", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? (await load${objName}s(db, { $match, $project, $limit: 1 }))[0] : null;
      return {
        ${objName}: result,
        success: true
      };
    }