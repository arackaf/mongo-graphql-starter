import { queryUtilities, processHook } from "mongo-graphql-starter";
import hooksObj from "../hooks"
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities;
import { ObjectId } from "mongodb";
import Thing from "./Thing";

export async function loadThings(db, queryPacket){
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    { $project },
    $sort ? { $sort } : null, 
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item)

  let Things = await db
    .collection("things")
    .aggregate(aggregateItems)
    .toArray();
  
  await processHook(hooksObj, "Thing", "adjustResults", Things);
  return Things;
}

export default {
  Query: {
    async getThing(root, args, context, ast) {
      await processHook(hooksObj, "Thing", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Thing, "Thing");
      await processHook(hooksObj, "Thing", "queryMiddleware", queryPacket, root, args, context, ast);
      let results = await loadThings(db, queryPacket);

      return {
        Thing: results[0] || null
      };
    },
    async allThings(root, args, context, ast) {
      await processHook(hooksObj, "Thing", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      let queryPacket = decontructGraphqlQuery(args, ast, Thing, "Things");
      await processHook(hooksObj, "Thing", "queryMiddleware", queryPacket, root, args, context, ast);
      let result = {};

      if (queryPacket.$project){
        result.Things = await loadThings(db, queryPacket);
      }

      if (queryPacket.metadataRequested.size){
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")){
          let countResults = (await db
            .collection("things")
            .aggregate([{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }])
            .toArray());
            
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    }
  },
  Mutation: {
    async createThing(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.Thing, Thing);
      let requestMap = parseRequestedFields(ast, "Thing");
      let $project = getMongoProjection(requestMap, Thing, args);

      if (await processHook(hooksObj, "Thing", "beforeInsert", newObject, root, args, context, ast) === false){
        return { Thing: null };
      }
      await db.collection("things").insert(newObject);
      await processHook(hooksObj, "Thing", "afterInsert", newObject, root, args, context, ast);

      let result = (await loadThings(db, { $match: { _id: newObject._id }, $project, $limit: 1 }))[0];
      return {
        Thing: result
      }
    },
    async updateThing(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      let updates = getUpdateObject(args.Thing || {}, Thing);

      let res = await processHook(hooksObj, "Thing", "beforeUpdate", $match, updates, root, args, context, ast);
      if (res === false){
        return { Thing: null };
      }
      if (updates.$set || updates.$inc || updates.$push || updates.$pull) {
        await db.collection("things").update($match, updates);
      }
      await processHook(hooksObj, "Thing", "afterUpdate", $match, updates, root, args, context, ast);
      
      let requestMap = parseRequestedFields(ast, "Thing");
      let $project = getMongoProjection(requestMap, Thing, args);
      
      let result = (await loadThings(db, { $match, $project, $limit: 1 }))[0];
      return {
        Thing: result
      }
    },
    async deleteThing(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      
      let res = await processHook(hooksObj, "Thing", "beforeDelete", $match, root, args, context, ast);
      if (res === false){
        return false;
      }
      await db.collection("things").remove($match);
      await processHook(hooksObj, "Thing", "afterDelete", $match, root, args, context, ast);
      return true;
    }
  }
};