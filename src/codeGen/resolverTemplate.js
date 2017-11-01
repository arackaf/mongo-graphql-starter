import { middleware, preprocessor, queryUtilities } from "mongo-graphql-starter";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities

import { ObjectId } from "mongodb";
import ${objName} from "./${objName}";

export default {
  Query: {
    async all${objName}s(root, args, context, ast) {
      await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let { $match, $project, $sort, $limit, $skip, metadataRequested } = await middleware.process(
        decontructGraphqlQuery(args, ast, ${objName}, "${objName}s"), 
        root, 
        args, 
        context, 
        ast
      );
      
      let result = {};

      if ($project){
        let aggregateItems = [
          { $match }, 
          { $project },
          $sort ? { $sort } : null, 
          $skip != null ? { $skip } : null, 
          $limit != null ? { $limit } : null
        ].filter(item => item)
      
        result.${objName}s = await db
          .collection("${table}")
          .aggregate(aggregateItems)
          .toArray()
      }

      if (metadataRequested){
        result.Meta = {};

        if (metadataRequested.get("count")){
          result.Meta.count = (await db
            .collection("${table}")
            .aggregate([{ $match }, { $group: { _id: null, count: { $sum: 1 } } }])
            .toArray())[0].count;
        }
      }

      return result;
    },
    async get${objName}(root, args, context, ast) {
      await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let { $match, $project } = await middleware.process(
        decontructGraphqlQuery(args, ast, ${objName}, "${objName}"), 
        root, 
        args, 
        context, 
        ast
      );

      return {
        ${objName}: (await db
          .collection("${table}")
          .aggregate([{ $match }, { $project }, { $limit: 1 }])
          .toArray())[0]
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

      if (updates.$set || updates.$inc || updates.$push) {
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
