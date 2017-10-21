import { middleware, preprocessor, queryUtilities } from "mongo-graphql-starter";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities

import { ObjectId } from "mongodb";
import Subject from "./Subject";

export default {
  Query: {
    async allSubjects(root, args, context, ast) {
      await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let { $match, $project, $sort, $limit, $skip } = await middleware.process(decontructGraphqlQuery(args, ast, Subject), root, args, context, ast);
      let aggregateItems = [{ $match }, { $project }].concat([
        $sort ? { $sort } : null, 
        $skip != null ? { $skip } : null, 
        $limit != null ? { $limit } : null
      ].filter(item => item));
    
      return (await db.collection("subjects").aggregate(aggregateItems)).toArray();
    },
    async getSubject(root, args, context, ast) {
      await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let { $match, $project } = await middleware.process(decontructGraphqlQuery(args, ast, Subject), root, args, context, ast);

      return (await db.collection("subjects").aggregate([{ $match }, { $project }, { $limit: 1 }]).toArray())[0];
    }
  },
  Mutation: {
    async createSubject(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args.Subject, Subject);
      let requestMap = parseRequestedFields(ast);
      let $project = getMongoProjection(requestMap, Subject, args);
      
      await db.collection("subjects").insert(newObject);
      return (await db.collection("subjects").aggregate([{ $match: { _id: newObject._id } }, { $project }, { $limit: 1 }]).toArray())[0];
    },
    async updateSubject(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let updates = getUpdateObject(args.Subject || {}, Subject);

      if (Object.keys(updates.$set).length){
        await db.collection("subjects").update({ _id: ObjectId(args._id) }, updates);
      }

      let requestMap = parseRequestedFields(ast);
      let $project = getMongoProjection(requestMap, Subject, args);
      
      return (await db.collection("subjects").aggregate([{ $match: { _id: ObjectId(args._id) } }, { $project }, { $limit: 1 }]).toArray())[0];
    },
    async deleteSubject(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;

      await db.collection("subjects").remove({ _id: ObjectId(args._id) });
      return true;
    }
  }
};
