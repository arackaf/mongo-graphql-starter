export async function load${objName}s(db, queryPacket) {
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    { $project },
    $sort ? { $sort } : null, 
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item);

  let ${objName}s = await dbHelpers.runQuery(db, "${table}", aggregateItems);
  ${relationships}
  await processHook(hooksObj, "${objName}", "adjustResults", ${objName}s);
  return ${objName}s;
}

export default {
  Query: {
    async get${objName}(root, args, context, ast) {
      await processHook(hooksObj, "${objName}", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, ${objName}, "${objName}");
      await processHook(hooksObj, "${objName}", "queryMiddleware", queryPacket, root, args, context, ast);
      let results = await load${objName}s(db, queryPacket);

      return {
        ${objName}: results[0] || null
      };
    },
    async all${objName}s(root, args, context, ast) {
      await processHook(hooksObj, "${objName}", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, ${objName}, "${objName}s");
      await processHook(hooksObj, "${objName}", "queryMiddleware", queryPacket, root, args, context, ast);
      let result = {};

      if (queryPacket.$project) {
        result.${objName}s = await load${objName}s(db, queryPacket);
      }

      if (queryPacket.metadataRequested.size) {
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")) {
          let countResults = await dbHelpers.runQuery(db, "${table}", [{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }]);  
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    }
  },
  Mutation: {
    async create${objName}(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.${objName}, ${objName});
      let requestMap = parseRequestedFields(ast, "${objName}");
      let $project = getMongoProjection(requestMap, ${objName}, args);

      if (await processHook(hooksObj, "${objName}", "beforeInsert", newObject, root, args, context, ast) === false) {
        return { ${objName}: null };
      }
      await dbHelpers.runInsert(db, "${table}", newObject);
      await processHook(hooksObj, "${objName}", "afterInsert", newObject, root, args, context, ast);

      let result = (await load${objName}s(db, { $match: { _id: newObject._id }, $project, $limit: 1 }))[0];
      return {
        ${objName}: result
      }
    },
    async update${objName}(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let db = await root.db;
      let { $match, $project } = decontructGraphqlQuery({ _id: args._id }, ast, ${objName}, "${objName}");
      let updates = getUpdateObject(args.Updates || {}, ${objName});

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
    },
    async update${objName}s(root, args, context, ast) {
      let db = await root.db;
      let { $match, $project } = decontructGraphqlQuery({ _id_in: args._ids }, ast, ${objName}, "${objName}s");
      let updates = getUpdateObject(args.Updates || {}, ${objName});

      if (await processHook(hooksObj, "${objName}", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "${table}", $match, updates, { multi: true });
      await processHook(hooksObj, "${objName}", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? await load${objName}s(db, { $match, $project }) : null;
      return {
        ${objName}s: result,
        success: true
      };
    },
    async update${objName}sBulk(root, args, context, ast) {
      let db = await root.db;
      let { $match } = decontructGraphqlQuery(args.Match, ast, ${objName});
      let updates = getUpdateObject(args.Updates || {}, ${objName});

      if (await processHook(hooksObj, "${objName}", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "${table}", $match, updates, { multi: true });
      await processHook(hooksObj, "${objName}", "afterUpdate", $match, updates, root, args, context, ast);

      return { success: true };
    },    
    async delete${objName}(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      
      if (await processHook(hooksObj, "${objName}", "beforeDelete", $match, root, args, context, ast) === false) {
        return false;
      }
      await dbHelpers.runDelete(db, "${table}", $match);
      await processHook(hooksObj, "${objName}", "afterDelete", $match, root, args, context, ast);
      return true;
    }
  }
};
