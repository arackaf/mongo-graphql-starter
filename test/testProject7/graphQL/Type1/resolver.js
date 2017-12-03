import { queryUtilities, processHook } from "mongo-graphql-starter";
import hooksObj from "../hooks"
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
  
  await processHook(hooksObj, "Type1", "adjustResults", Type1s);
  return Type1s;
}

export default {
  Query: {
    async getType1(root, args, context, ast) {
      await processHook(hooksObj, "Type1", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Type1, "Type1");
      await processHook(hooksObj, "Type1", "queryMiddleware", queryPacket, root, args, context, ast);
      let results = await loadType1s(db, queryPacket);

      return {
        Type1: results[0] || null
      };
    },
    async allType1s(root, args, context, ast) {
      await processHook(hooksObj, "Type1", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Type1, "Type1s");
      await processHook(hooksObj, "Type1", "queryMiddleware", queryPacket, root, args, context, ast);
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
    }
  },
  Mutation: {
    async createType1(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.Type1, Type1);
      let requestMap = parseRequestedFields(ast, "Type1");
      let $project = getMongoProjection(requestMap, Type1, args);

      if (await processHook(hooksObj, "Type1", "beforeInsert", newObject, root, args, context, ast) === false){
        return { Type1: null };
      }
      await db.collection("type1").insert(newObject);
      await processHook(hooksObj, "Type1", "afterInsert", newObject, root, args, context, ast);

      let result = (await loadType1s(db, { $match: { _id: newObject._id }, $project, $limit: 1 }))[0];
      return {
        Type1: result
      }
    },
    async updateType1(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      let updates = getUpdateObject(args.Type1 || {}, Type1);

      let res = await processHook(hooksObj, "Type1", "beforeUpdate", $match, updates, root, args, context, ast);
      if (res === false){
        return { Type1: null };
      }
      if (updates.$set || updates.$inc || updates.$push || updates.$pull) {
        await db.collection("type1").update($match, updates);
      }
      await processHook(hooksObj, "Type1", "afterUpdate", $match, updates, root, args, context, ast);
      
      let requestMap = parseRequestedFields(ast, "Type1");
      let $project = getMongoProjection(requestMap, Type1, args);
      
      let result = (await loadType1s(db, { $match, $project, $limit: 1 }))[0];
      return {
        Type1: result
      }
    },
    async deleteType1(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      
      let res = await processHook(hooksObj, "Type1", "beforeDelete", $match, root, args, context, ast);
      if (res === false){
        return false;
      }
      await db.collection("type1").remove($match);
      await processHook(hooksObj, "Type1", "afterDelete", $match, root, args, context, ast);
      return true;
    }
  }
};