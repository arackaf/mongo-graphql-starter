export async function load${objName}s(db, queryPacket){
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    { $project },
    $sort ? { $sort } : null, 
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item)

  let ${objName}s = await db
    .collection("${table}")
    .aggregate(aggregateItems)
    .toArray();
  ${relationships}
  return ${objName}s;
}

export default {
  Query: {
    async all${objName}s(root, args, context, ast) {
      await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let queryPacket = await middleware.process(
        decontructGraphqlQuery(args, ast, ${objName}, "${objName}s"), 
        root, 
        args, 
        context, 
        ast
      );
      
      let result = {};

      if (queryPacket.$project){
        result.${objName}s = await load${objName}s(db, queryPacket);
      }

      if (queryPacket.metadataRequested.size){
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")){
          let countResults = (await db
            .collection("${table}")
            .aggregate([{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }])
            .toArray());
            
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    },
    async get${objName}(root, args, context, ast) {
      await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let queryPacket = await middleware.process(
        decontructGraphqlQuery(args, ast, ${objName}, "${objName}"), 
        root, 
        args, 
        context, 
        ast
      );

      let results = await load${objName}s(db, queryPacket);

      return {
        ${objName}: results[0] || null
      };
    }
  },
  Mutation: {
    async create${objName}(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.${objName}, ${objName});
      let requestMap = parseRequestedFields(ast, "${objName}");
      let $project = getMongoProjection(requestMap, ${objName}, args);
      
      await db.collection("${table}").insert(newObject);
      return {
        ${objName}: (await db
          .collection("${table}")
          .aggregate([{ $match: { _id: newObject._id } }, { $project }, { $limit: 1 }])
          .toArray())[0]
      };
    },
    async update${objName}(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let updates = getUpdateObject(args.${objName} || {}, ${objName});

      if (updates.$set || updates.$inc || updates.$push || updates.$pull) {
        await db.collection("${table}").update({ _id: ObjectId(args._id) }, updates);
      }

      let requestMap = parseRequestedFields(ast, "${objName}");
      let $project = getMongoProjection(requestMap, ${objName}, args);
      
      return {
        ${objName}: (await db
          .collection("${table}")
          .aggregate([{ $match: { _id: ObjectId(args._id) } }, { $project }, { $limit: 1 }])
          .toArray())[0]
      }
    },
    async delete${objName}(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;

      await db.collection("${table}").remove({ _id: ObjectId(args._id) });
      return true;
    }
  }
};
