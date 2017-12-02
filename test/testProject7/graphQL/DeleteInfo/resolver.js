import { queryUtilities, processHook } from "mongo-graphql-starter";
import hooksObj from "../hooks"
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities;
import { ObjectId } from "mongodb";
import DeleteInfo from "./DeleteInfo";

export async function loadDeleteInfos(db, queryPacket){
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    { $project },
    $sort ? { $sort } : null, 
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item)

  let DeleteInfos = await db
    .collection("deleteInfo")
    .aggregate(aggregateItems)
    .toArray();
  
  await processHook(hooksObj, "DeleteInfo", "adjustResults", DeleteInfos);
  return DeleteInfos;
}

export default {
  Query: {
    async getDeleteInfo(root, args, context, ast) {
      await processHook(hooksObj, "DeleteInfo", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, DeleteInfo, "DeleteInfo");
      await processHook(hooksObj, "DeleteInfo", "queryMiddleware", queryPacket, root, args, context, ast);
      let results = await loadDeleteInfos(db, queryPacket);

      return {
        DeleteInfo: results[0] || null
      };
    },
    async allDeleteInfos(root, args, context, ast) {
      await processHook(hooksObj, "DeleteInfo", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, DeleteInfo, "DeleteInfos");
      await processHook(hooksObj, "DeleteInfo", "queryMiddleware", queryPacket, root, args, context, ast);
      let result = {};

      if (queryPacket.$project){
        result.DeleteInfos = await loadDeleteInfos(db, queryPacket);
      }

      if (queryPacket.metadataRequested.size){
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")){
          let countResults = (await db
            .collection("deleteInfo")
            .aggregate([{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }])
            .toArray());
            
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    }
  },
  Mutation: {
    async createDeleteInfo(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.DeleteInfo, DeleteInfo);
      let requestMap = parseRequestedFields(ast, "DeleteInfo");
      let $project = getMongoProjection(requestMap, DeleteInfo, args);

      await processHook(hooksObj, "DeleteInfo", "beforeInsert", newObject, root, args, context, ast);
      await db.collection("deleteInfo").insert(newObject);
      await processHook(hooksObj, "DeleteInfo", "afterInsert", newObject, root, args, context, ast);

      let result = (await loadDeleteInfos(db, { $match: { _id: newObject._id }, $project, $limit: 1 }))[0];
      return {
        DeleteInfo: result
      }
    },
    async updateDeleteInfo(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      let updates = getUpdateObject(args.DeleteInfo || {}, DeleteInfo);

      await processHook(hooksObj, "DeleteInfo", "beforeUpdate", $match, updates, root, args, context, ast);
      if (updates.$set || updates.$inc || updates.$push || updates.$pull) {
        await db.collection("deleteInfo").update($match, updates);
      }
      await processHook(hooksObj, "DeleteInfo", "afterUpdate", $match, updates, root, args, context, ast);
      
      let requestMap = parseRequestedFields(ast, "DeleteInfo");
      let $project = getMongoProjection(requestMap, DeleteInfo, args);
      
      let result = (await loadDeleteInfos(db, { $match, $project, $limit: 1 }))[0];
      return {
        DeleteInfo: result
      }
    },
    async deleteDeleteInfo(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      
      await processHook(hooksObj, "DeleteInfo", "beforeDelete", $match, root, args, context, ast);
      await db.collection("deleteInfo").remove($match);
      await processHook(hooksObj, "DeleteInfo", "afterDelete", $match, root, args, context, ast);
      return true;
    }
  }
};