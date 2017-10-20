import { middleware, preprocessor, queryUtilities } from "mongo-graphql-starter";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject } = queryUtilities

import { ObjectId } from "mongodb";
import Book from "./Book";

export default {
  Query: {
    async allBooks(root, args, context, ast) {
      await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let { $match, $project, $sort, $limit, $skip } = await middleware.process(decontructGraphqlQuery(args, ast, Book), root, args, context, ast);
      let aggregateItems = [{ $match }, { $project }].concat([
        $sort ? { $sort } : null, 
        $skip != null ? { $skip } : null, 
        $limit != null ? { $limit } : null
      ].filter(item => item));
    
      return (await db.collection("books").aggregate(aggregateItems)).toArray();
    },
    async getBook(root, args, context, ast) {
      await preprocessor.process(root, args, context, ast);
      let db = await root.db;
      let { $match, $project } = await middleware.process(decontructGraphqlQuery(args, ast, Book), root, args, context, ast);

      return (await db.collection("books").aggregate([{ $match }, { $project }, { $limit: 1 }]).toArray())[0];
    }
  },
  Mutation: {
    async createBook(root, args, context, ast) {
      let db = await root.db;
      let newObject = newObjectFromArgs(args, Book);
      let requestMap = parseRequestedFields(ast);
      let $project = getMongoProjection(requestMap, Book, args);
      
      await db.collection("books").insert(newObject);
      return (await db.collection("books").aggregate([{ $match: { _id: newObject._id } }, { $project }, { $limit: 1 }]).toArray())[0];
    },
    async updateBook(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;
      let updates = getUpdateObject(args, Book);

      if (Object.keys(updates.$set).length){
        await db.collection("books").update({ _id: ObjectId(args._id) }, updates);
      }

      let requestMap = parseRequestedFields(ast);
      let $project = getMongoProjection(requestMap, Book, args);
      
      return (await db.collection("books").aggregate([{ $match: { _id: ObjectId(args._id) } }, { $project }, { $limit: 1 }]).toArray())[0];
    },
    async deleteBook(root, args, context, ast) {
      if (!args._id){
        throw "No _id sent";
      }
      let db = await root.db;

      await db.collection("books").remove({ _id: ObjectId(args._id) });
      return true;
    }
  }
};
