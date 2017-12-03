import { queryUtilities, processHook } from "mongo-graphql-starter";
import hooksObj from "../hooks"
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
  
  await processHook(hooksObj, "Type2", "adjustResults", Type2s);
  return Type2s;
}

export default {
  Query: {
    async getType2(root, args, context, ast) {
      await processHook(hooksObj, "Type2", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Type2, "Type2");
      await processHook(hooksObj, "Type2", "queryMiddleware", queryPacket, root, args, context, ast);
      let results = await loadType2s(db, queryPacket);

      return {
        Type2: results[0] || null
      };
    },
    async allType2s(root, args, context, ast) {
      await processHook(hooksObj, "Type2", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Type2, "Type2s");
      await processHook(hooksObj, "Type2", "queryMiddleware", queryPacket, root, args, context, ast);
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
    }
  },
  Mutation: {
    async createType2(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.Type2, Type2);
      let requestMap = parseRequestedFields(ast, "Type2");
      let $project = getMongoProjection(requestMap, Type2, args);

      if (await processHook(hooksObj, "Type2", "beforeInsert", newObject, root, args, context, ast) === false){
        return { Type2: null };
      }
      await db.collection("type2").insert(newObject);
      await processHook(hooksObj, "Type2", "afterInsert", newObject, root, args, context, ast);

      let result = (await loadType2s(db, { $match: { _id: newObject._id }, $project, $limit: 1 }))[0];
      return {
        Type2: result
      }
    },
    async updateType2(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      let updates = getUpdateObject(args.Type2 || {}, Type2);

      let res = await processHook(hooksObj, "Type2", "beforeUpdate", $match, updates, root, args, context, ast);
      if (res === false){
        return { Type2: null };
      }
      if (updates.$set || updates.$inc || updates.$push || updates.$pull) {
        await db.collection("type2").update($match, updates);
      }
      await processHook(hooksObj, "Type2", "afterUpdate", $match, updates, root, args, context, ast);
      
      let requestMap = parseRequestedFields(ast, "Type2");
      let $project = getMongoProjection(requestMap, Type2, args);
      
      let result = (await loadType2s(db, { $match, $project, $limit: 1 }))[0];
      return {
        Type2: result
      }
    },
    async deleteType2(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      
      let res = await processHook(hooksObj, "Type2", "beforeDelete", $match, root, args, context, ast);
      if (res === false){
        return false;
      }
      await db.collection("type2").remove($match);
      await processHook(hooksObj, "Type2", "afterDelete", $match, root, args, context, ast);
      return true;
    }
  }
};