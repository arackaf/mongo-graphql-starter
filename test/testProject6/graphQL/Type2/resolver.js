import { queryUtilities } from "mongo-graphql-starter";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities;
import { ObjectId } from "mongodb";
import Type2 from "./Type2";

export async function loadType2s(db, queryPacket){
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    { $project },
    $sort ? { $sort } : null, 
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item)

  let Type2s = await db
    .collection("type2")
    .aggregate(aggregateItems)
    .toArray();
  
  return Type2s;
}

export default {
  Query: {
    async allType2s(root, args, context, ast) {
      //await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Type2, "Type2s");
      /*
      let queryPacket = await middleware.process(
        decontructGraphqlQuery(args, ast, Type2, "Type2s"), 
        root, 
        args, 
        context, 
        ast
      );
      */
      
      let result = {};

      if (queryPacket.$project){
        result.Type2s = await loadType2s(db, queryPacket);
      }

      if (queryPacket.metadataRequested.size){
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")){
          let countResults = (await db
            .collection("type2")
            .aggregate([{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }])
            .toArray());
            
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    },
    async getType2(root, args, context, ast) {
      //await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Type2, "Type2");
      /*
      let queryPacket = await middleware.process(
        decontructGraphqlQuery(args, ast, Type2, "Type2"), 
        root, 
        args, 
        context, 
        ast
      );
      */

      let results = await loadType2s(db, queryPacket);

      return {
        Type2: results[0] || null
      };
    }
  },
  Mutation: {
    async createType2(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.Type2, Type2);
      let requestMap = parseRequestedFields(ast, "Type2");
      let $project = getMongoProjection(requestMap, Type2, args);
      
      await db.collection("type2").insert(newObject);
      return {
        Type2: (await db
          .collection("type2")
          .aggregate([{ $match: { _id: newObject._id } }, { $project }, { $limit: 1 }])
          .toArray())[0]
      };
    },
    async updateType2(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let updates = getUpdateObject(args.Type2 || {}, Type2);

      if (updates.$set || updates.$inc || updates.$push || updates.$pull) {
        await db.collection("type2").update({ _id: ObjectId(args._id) }, updates);
      }

      let requestMap = parseRequestedFields(ast, "Type2");
      let $project = getMongoProjection(requestMap, Type2, args);
      
      return {
        Type2: (await db
          .collection("type2")
          .aggregate([{ $match: { _id: ObjectId(args._id) } }, { $project }, { $limit: 1 }])
          .toArray())[0]
      }
    },
    async deleteType2(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;

      await db.collection("type2").remove({ _id: ObjectId(args._id) });
      return true;
    }
  }
};