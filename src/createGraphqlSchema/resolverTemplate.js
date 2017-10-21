import { middleware, preprocessor, queryUtilities } from "mongo-graphql-starter";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities

import { ObjectId } from "mongodb";
import ${objName} from "./${objName}";

export default {
  Query: {
    async all${objName}s(root, args, context, ast) {
      await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let { $match, $project, $sort, $limit, $skip } = await middleware.process(decontructGraphqlQuery(args, ast, ${objName}), root, args, context, ast);
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
      let newObject = newObjectFromArgs(args.${objName}, ${objName});
      let requestMap = parseRequestedFields(ast);
      let $project = getMongoProjection(requestMap, ${objName}, args);
      
      await db.collection("${table}").insert(newObject);
      return (await db.collection("${table}").aggregate([{ $match: { _id: newObject._id } }, { $project }, { $limit: 1 }]).toArray())[0];
    },
    async update${objName}(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let updates = getUpdateObject(args.${objName} || {}, ${objName});

      if (Object.keys(updates.$set).length){
        await db.collection("${table}").update({ _id: ObjectId(args._id) }, updates);
      }

      let requestMap = parseRequestedFields(ast);
      let $project = getMongoProjection(requestMap, ${objName}, args);
      
      return (await db.collection("${table}").aggregate([{ $match: { _id: ObjectId(args._id) } }, { $project }, { $limit: 1 }]).toArray())[0];
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
