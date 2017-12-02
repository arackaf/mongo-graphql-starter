import { queryUtilities, processHook } from "mongo-graphql-starter";
import hooksObj from "../hooks"
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities;
import { ObjectId } from "mongodb";
import UpdateInfo from "./UpdateInfo";

export async function loadUpdateInfos(db, queryPacket){
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    { $project },
    $sort ? { $sort } : null, 
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item)

  let UpdateInfos = await db
    .collection("updateInfo")
    .aggregate(aggregateItems)
    .toArray();
  
  await processHook(hooksObj, "UpdateInfo", "adjustResults", UpdateInfos);
  return UpdateInfos;
}

export default {
  Query: {
    async getUpdateInfo(root, args, context, ast) {
      await processHook(hooksObj, "UpdateInfo", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, UpdateInfo, "UpdateInfo");
      await processHook(hooksObj, "UpdateInfo", "queryMiddleware", queryPacket, root, args, context, ast);
      let results = await loadUpdateInfos(db, queryPacket);

      return {
        UpdateInfo: results[0] || null
      };
    },
    async allUpdateInfos(root, args, context, ast) {
      await processHook(hooksObj, "UpdateInfo", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, UpdateInfo, "UpdateInfos");
      await processHook(hooksObj, "UpdateInfo", "queryMiddleware", queryPacket, root, args, context, ast);
      let result = {};

      if (queryPacket.$project){
        result.UpdateInfos = await loadUpdateInfos(db, queryPacket);
      }

      if (queryPacket.metadataRequested.size){
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")){
          let countResults = (await db
            .collection("updateInfo")
            .aggregate([{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }])
            .toArray());
            
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    }
  },
  Mutation: {
    async createUpdateInfo(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.UpdateInfo, UpdateInfo);
      let requestMap = parseRequestedFields(ast, "UpdateInfo");
      let $project = getMongoProjection(requestMap, UpdateInfo, args);

      await processHook(hooksObj, "UpdateInfo", "beforeInsert", newObject, root, args, context, ast);
      await db.collection("updateInfo").insert(newObject);
      await processHook(hooksObj, "UpdateInfo", "afterInsert", newObject, root, args, context, ast);

      let result = (await loadUpdateInfos(db, { $match: { _id: newObject._id }, $project, $limit: 1 }))[0];
      return {
        UpdateInfo: result
      }
    },
    async updateUpdateInfo(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      let updates = getUpdateObject(args.UpdateInfo || {}, UpdateInfo);

      await processHook(hooksObj, "UpdateInfo", "beforeUpdate", $match, updates, root, args, context, ast);
      if (updates.$set || updates.$inc || updates.$push || updates.$pull) {
        await db.collection("updateInfo").update($match, updates);
      }
      await processHook(hooksObj, "UpdateInfo", "afterUpdate", $match, updates, root, args, context, ast);
      
      let requestMap = parseRequestedFields(ast, "UpdateInfo");
      let $project = getMongoProjection(requestMap, UpdateInfo, args);
      
      let result = (await loadUpdateInfos(db, { $match, $project, $limit: 1 }))[0];
      return {
        UpdateInfo: result
      }
    },
    async deleteUpdateInfo(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      
      await processHook(hooksObj, "UpdateInfo", "beforeDelete", $match, root, args, context, ast);
      await db.collection("updateInfo").remove($match);
      await processHook(hooksObj, "UpdateInfo", "afterDelete", $match, root, args, context, ast);
      return true;
    }
  }
};