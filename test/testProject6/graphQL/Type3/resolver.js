import { queryUtilities } from "mongo-graphql-starter";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities;
import { ObjectId } from "mongodb";
import Type3 from "./Type3";

export async function loadType3s(db, queryPacket){
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    { $project },
    $sort ? { $sort } : null, 
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item)

  let Type3s = await db
    .collection("type3")
    .aggregate(aggregateItems)
    .toArray();
  
  return Type3s;
}

export default {
  Query: {
    async allType3s(root, args, context, ast) {
      //await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Type3, "Type3s");
      /*
      let queryPacket = await middleware.process(
        decontructGraphqlQuery(args, ast, Type3, "Type3s"), 
        root, 
        args, 
        context, 
        ast
      );
      */
      
      let result = {};

      if (queryPacket.$project){
        result.Type3s = await loadType3s(db, queryPacket);
      }

      if (queryPacket.metadataRequested.size){
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")){
          let countResults = (await db
            .collection("type3")
            .aggregate([{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }])
            .toArray());
            
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    },
    async getType3(root, args, context, ast) {
      //await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Type3, "Type3");
      /*
      let queryPacket = await middleware.process(
        decontructGraphqlQuery(args, ast, Type3, "Type3"), 
        root, 
        args, 
        context, 
        ast
      );
      */

      let results = await loadType3s(db, queryPacket);

      return {
        Type3: results[0] || null
      };
    }
  },
  Mutation: {
    async createType3(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.Type3, Type3);
      let requestMap = parseRequestedFields(ast, "Type3");
      let $project = getMongoProjection(requestMap, Type3, args);
      
      await db.collection("type3").insert(newObject);
      return {
        Type3: (await db
          .collection("type3")
          .aggregate([{ $match: { _id: newObject._id } }, { $project }, { $limit: 1 }])
          .toArray())[0]
      };
    },
    async updateType3(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let updates = getUpdateObject(args.Type3 || {}, Type3);

      if (updates.$set || updates.$inc || updates.$push || updates.$pull) {
        await db.collection("type3").update({ _id: ObjectId(args._id) }, updates);
      }

      let requestMap = parseRequestedFields(ast, "Type3");
      let $project = getMongoProjection(requestMap, Type3, args);
      
      return {
        Type3: (await db
          .collection("type3")
          .aggregate([{ $match: { _id: ObjectId(args._id) } }, { $project }, { $limit: 1 }])
          .toArray())[0]
      }
    },
    async deleteType3(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;

      await db.collection("type3").remove({ _id: ObjectId(args._id) });
      return true;
    }
  }
};