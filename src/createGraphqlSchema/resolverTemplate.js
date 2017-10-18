import { decontructGraphqlQuery, getMongoProjection, newObjectFromArgs, middleware, preprocessor } from "mongo-graphql-starter";
import ${objName} from "./${objName}";

export default {
  Query: {
    async all${objName}s(root, args, context, ast) {
      await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let { $match, requestedFields, $project, $sort, $limit, $skip } = await middleware.process(decontructGraphqlQuery(args, ast, ${objName}), root, args, context, ast);
      let aggregateItems = [{ $match }, { $project }].concat([
        $sort ? { $sort } : null, 
        $skip != null ? { $skip } : null, 
        $limit != null ? { $limit } : null
      ].filter(item => item));
    
      return (await db.collection("${table}").aggregate(aggregateItems)).toArray();
    },
    async get${objName}(root, args, context, ast) {
      await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let { $match, $project } = await middleware.process(decontructGraphqlQuery(args, ast, ${objName}), root, args, context, ast);

      return (await db.collection("${table}").aggregate([{ $match }, { $project }, { $limit: 1 }]).toArray())[0];
    }
  },
  Mutation: {
    async create${objName}(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args, ${objName});
      let $project = null;
      
      await db.collection("${table}").insert(newObject);
      return (await db.collection("${table}").aggregate([{ $match: { _id: newObject._id } }, { $limit: 1 }]).toArray())[0];
    }
  }
};
