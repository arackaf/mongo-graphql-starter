import { queryUtilities } from "mongo-graphql-starter";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities;
import { ObjectId } from "mongodb";
import Type4 from "./Type4";

export async function loadType4s(db, queryPacket){
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    { $project },
    $sort ? { $sort } : null, 
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item)

  let Type4s = await db
    .collection("type4")
    .aggregate(aggregateItems)
    .toArray();
  
  return Type4s;
}

export default {
  Query: {
    async allType4s(root, args, context, ast) {
      //await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Type4, "Type4s");
      /*
      let queryPacket = await middleware.process(
        decontructGraphqlQuery(args, ast, Type4, "Type4s"), 
        root, 
        args, 
        context, 
        ast
      );
      */
      
      let result = {};

      if (queryPacket.$project){
        result.Type4s = await loadType4s(db, queryPacket);
      }

      if (queryPacket.metadataRequested.size){
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")){
          let countResults = (await db
            .collection("type4")
            .aggregate([{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }])
            .toArray());
            
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    },
    async getType4(root, args, context, ast) {
      //await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Type4, "Type4");
      /*
      let queryPacket = await middleware.process(
        decontructGraphqlQuery(args, ast, Type4, "Type4"), 
        root, 
        args, 
        context, 
        ast
      );
      */

      let results = await loadType4s(db, queryPacket);

      return {
        Type4: results[0] || null
      };
    }
  },
  Mutation: {
    async createType4(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.Type4, Type4);
      let requestMap = parseRequestedFields(ast, "Type4");
      let $project = getMongoProjection(requestMap, Type4, args);
      
      await db.collection("type4").insert(newObject);
      return {
        Type4: (await db
          .collection("type4")
          .aggregate([{ $match: { _id: newObject._id } }, { $project }, { $limit: 1 }])
          .toArray())[0]
      };
    },
    async updateType4(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let updates = getUpdateObject(args.Type4 || {}, Type4);

      if (updates.$set || updates.$inc || updates.$push || updates.$pull) {
        await db.collection("type4").update({ _id: ObjectId(args._id) }, updates);
      }

      let requestMap = parseRequestedFields(ast, "Type4");
      let $project = getMongoProjection(requestMap, Type4, args);
      
      return {
        Type4: (await db
          .collection("type4")
          .aggregate([{ $match: { _id: ObjectId(args._id) } }, { $project }, { $limit: 1 }])
          .toArray())[0]
      }
    },
    async deleteType4(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;

      await db.collection("type4").remove({ _id: ObjectId(args._id) });
      return true;
    }
  }
};