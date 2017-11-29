import { queryUtilities } from "mongo-graphql-starter";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities;
import { ObjectId } from "mongodb";
import Type1 from "./Type1";

export async function loadType1s(db, queryPacket){
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    { $project },
    $sort ? { $sort } : null, 
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item)

  let Type1s = await db
    .collection("type1")
    .aggregate(aggregateItems)
    .toArray();
  
  return Type1s;
}

export default {
  Query: {
    async allType1s(root, args, context, ast) {
      //await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Type1, "Type1s");
      /*
      let queryPacket = await middleware.process(
        decontructGraphqlQuery(args, ast, Type1, "Type1s"), 
        root, 
        args, 
        context, 
        ast
      );
      */
      
      let result = {};

      if (queryPacket.$project){
        result.Type1s = await loadType1s(db, queryPacket);
      }

      if (queryPacket.metadataRequested.size){
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")){
          let countResults = (await db
            .collection("type1")
            .aggregate([{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }])
            .toArray());
            
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    },
    async getType1(root, args, context, ast) {
      //await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Type1, "Type1");
      /*
      let queryPacket = await middleware.process(
        decontructGraphqlQuery(args, ast, Type1, "Type1"), 
        root, 
        args, 
        context, 
        ast
      );
      */

      let results = await loadType1s(db, queryPacket);

      return {
        Type1: results[0] || null
      };
    }
  },
  Mutation: {
    async createType1(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.Type1, Type1);
      let requestMap = parseRequestedFields(ast, "Type1");
      let $project = getMongoProjection(requestMap, Type1, args);
      
      await db.collection("type1").insert(newObject);
      return {
        Type1: (await db
          .collection("type1")
          .aggregate([{ $match: { _id: newObject._id } }, { $project }, { $limit: 1 }])
          .toArray())[0]
      };
    },
    async updateType1(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let updates = getUpdateObject(args.Type1 || {}, Type1);

      if (updates.$set || updates.$inc || updates.$push || updates.$pull) {
        await db.collection("type1").update({ _id: ObjectId(args._id) }, updates);
      }

      let requestMap = parseRequestedFields(ast, "Type1");
      let $project = getMongoProjection(requestMap, Type1, args);
      
      return {
        Type1: (await db
          .collection("type1")
          .aggregate([{ $match: { _id: ObjectId(args._id) } }, { $project }, { $limit: 1 }])
          .toArray())[0]
      }
    },
    async deleteType1(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;

      await db.collection("type1").remove({ _id: ObjectId(args._id) });
      return true;
    }
  }
};