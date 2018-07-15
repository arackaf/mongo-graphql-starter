import { queryUtilities, processHook, dbHelpers } from "../../../../src/module";
import hooksObj from "../hooks";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject, constants } = queryUtilities;
import { ObjectId } from "mongodb";
import BookMetadata from "./Book";

export async function loadBooks(db, queryPacket, root, args, context, ast) {
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    $sort ? { $sort } : null, 
    { $project },
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item);

  await processHook(hooksObj, "Book", "queryPreAggregate", aggregateItems, root, args, context, ast);
  let Books = await dbHelpers.runQuery(db, "books", aggregateItems);
  await processHook(hooksObj, "Book", "adjustResults", Books);
  return Books;
}

export const Book = {


}

export default {
  Query: {
    async getBook(root, args, context, ast) {
      await processHook(hooksObj, "Book", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, BookMetadata, "Book");
      await processHook(hooksObj, "Book", "queryMiddleware", queryPacket, root, args, context, ast);
      let results = await loadBooks(db, queryPacket, root, args, context, ast);

      return {
        Book: results[0] || null
      };
    },
    async allBooks(root, args, context, ast) {
      await processHook(hooksObj, "Book", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, BookMetadata, "Books");
      await processHook(hooksObj, "Book", "queryMiddleware", queryPacket, root, args, context, ast);
      let result = {};

      if (queryPacket.$project) {
        result.Books = await loadBooks(db, queryPacket, root, args, context, ast);
      }

      if (queryPacket.metadataRequested.size) {
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")) {
          let countResults = await dbHelpers.runQuery(db, "books", [{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }]);  
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    }
  },
  Mutation: {
    async createBook(root, args, context, ast) {
      let db = await root.db;
      context.__mongodb = db;
      let newObject = await newObjectFromArgs(args.Book, BookMetadata, { db, dbHelpers, hooksObj, root, args, context, ast });
      let requestMap = parseRequestedFields(ast, "Book");
      let $project = requestMap.size ? getMongoProjection(requestMap, BookMetadata, args) : null;

      if ((newObject = await dbHelpers.processInsertion(db, newObject, { typeMetadata: BookMetadata, hooksObj, root, args, context, ast })) == null) {
        return { Book: null };
      }
      let result = $project ? (await loadBooks(db, { $match: { _id: newObject._id }, $project, $limit: 1 }, root, args, context, ast))[0] : null;
      return {
        success: true,
        Book: result
      }
    },
    async updateBook(root, args, context, ast) {
      let db = await root.db;
      context.__mongodb = db;
      let { $match, $project } = decontructGraphqlQuery(args._id ? { _id: args._id } : {}, ast, BookMetadata, "Book");
      let updates = await getUpdateObject(args.Updates || {}, BookMetadata, { db, dbHelpers, hooksObj, root, args, context, ast });

      if (await processHook(hooksObj, "Book", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { Book: null };
      }
      if (!$match._id) {
        throw "No _id sent, or inserted in middleware";
      }
      await dbHelpers.runUpdate(db, "books", $match, updates);
      await processHook(hooksObj, "Book", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? (await loadBooks(db, { $match, $project, $limit: 1 }, root, args, context, ast))[0] : null;
      return {
        Book: result,
        success: true
      };
    },
    async updateBooks(root, args, context, ast) {
      let db = await root.db;
      context.__mongodb = db;
      let { $match, $project } = decontructGraphqlQuery({ _id_in: args._ids }, ast, BookMetadata, "Books");
      let updates = await getUpdateObject(args.Updates || {}, BookMetadata, { db, dbHelpers, hooksObj, root, args, context, ast });

      if (await processHook(hooksObj, "Book", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "books", $match, updates, { multi: true });
      await processHook(hooksObj, "Book", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? await loadBooks(db, { $match, $project }, root, args, context, ast) : null;
      return {
        Books: result,
        success: true
      };
    },
    async updateBooksBulk(root, args, context, ast) {
      let db = await root.db;
      let { $match } = decontructGraphqlQuery(args.Match, ast, BookMetadata);
      let updates = await getUpdateObject(args.Updates || {}, BookMetadata, { db, dbHelpers, hooksObj, root, args, context, ast });

      if (await processHook(hooksObj, "Book", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "books", $match, updates, { multi: true });
      await processHook(hooksObj, "Book", "afterUpdate", $match, updates, root, args, context, ast);

      return { success: true };
    },
    async deleteBook(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      
      if (await processHook(hooksObj, "Book", "beforeDelete", $match, root, args, context, ast) === false) {
        return false;
      }
      await dbHelpers.runDelete(db, "books", $match);
      await processHook(hooksObj, "Book", "afterDelete", $match, root, args, context, ast);
      return true;
    }
  }
};