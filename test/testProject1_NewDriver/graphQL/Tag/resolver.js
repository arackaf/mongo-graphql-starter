import { queryUtilities, processHook, dbHelpers } from "../../../../src/module";
import hooksObj from "../hooks";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject, constants } = queryUtilities;
import { ObjectId } from "mongodb";
import TagMetadata from "./Tag";

export async function loadTags(db, queryPacket, root, args, context, ast) {
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    $sort ? { $sort } : null, 
    { $project },
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item);

  await processHook(hooksObj, "Tag", "queryPreAggregate", aggregateItems, root, args, context, ast);
  let Tags = await dbHelpers.runQuery(db, "tags", aggregateItems);
  await processHook(hooksObj, "Tag", "adjustResults", Tags);
  return Tags;
}

export const Tag = {


}

export default {
  Query: {
    async getTag(root, args, context, ast) {
      await processHook(hooksObj, "Tag", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, TagMetadata, "Tag");
      await processHook(hooksObj, "Tag", "queryMiddleware", queryPacket, root, args, context, ast);
      let results = await loadTags(db, queryPacket, root, args, context, ast);

      return {
        Tag: results[0] || null
      };
    },
    async allTags(root, args, context, ast) {
      await processHook(hooksObj, "Tag", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, TagMetadata, "Tags");
      await processHook(hooksObj, "Tag", "queryMiddleware", queryPacket, root, args, context, ast);
      let result = {};

      if (queryPacket.$project) {
        result.Tags = await loadTags(db, queryPacket, root, args, context, ast);
      }

      if (queryPacket.metadataRequested.size) {
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")) {
          let countResults = await dbHelpers.runQuery(db, "tags", [{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }]);  
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    }
  },
  Mutation: {
    async createTag(root, args, context, ast) {
      let db = await root.db;
      context.__mongodb = db;
      let newObject = await newObjectFromArgs(args.Tag, TagMetadata, { db, dbHelpers, hooksObj, root, args, context, ast });
      let requestMap = parseRequestedFields(ast, "Tag");
      let $project = requestMap.size ? getMongoProjection(requestMap, TagMetadata, args) : null;

      if ((newObject = await dbHelpers.processInsertion(db, newObject, { typeMetadata: TagMetadata, hooksObj, root, args, context, ast })) == null) {
        return { Tag: null };
      }
      let result = $project ? (await loadTags(db, { $match: { _id: newObject._id }, $project, $limit: 1 }, root, args, context, ast))[0] : null;
      return {
        success: true,
        Tag: result
      }
    },
    async updateTag(root, args, context, ast) {
      let db = await root.db;
      context.__mongodb = db;
      let { $match, $project } = decontructGraphqlQuery(args._id ? { _id: args._id } : {}, ast, TagMetadata, "Tag");
      let updates = await getUpdateObject(args.Updates || {}, TagMetadata, { db, dbHelpers, hooksObj, root, args, context, ast });

      if (await processHook(hooksObj, "Tag", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { Tag: null };
      }
      if (!$match._id) {
        throw "No _id sent, or inserted in middleware";
      }
      await dbHelpers.runUpdate(db, "tags", $match, updates);
      await processHook(hooksObj, "Tag", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? (await loadTags(db, { $match, $project, $limit: 1 }, root, args, context, ast))[0] : null;
      return {
        Tag: result,
        success: true
      };
    },
    async updateTags(root, args, context, ast) {
      let db = await root.db;
      context.__mongodb = db;
      let { $match, $project } = decontructGraphqlQuery({ _id_in: args._ids }, ast, TagMetadata, "Tags");
      let updates = await getUpdateObject(args.Updates || {}, TagMetadata, { db, dbHelpers, hooksObj, root, args, context, ast });

      if (await processHook(hooksObj, "Tag", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "tags", $match, updates, { multi: true });
      await processHook(hooksObj, "Tag", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? await loadTags(db, { $match, $project }, root, args, context, ast) : null;
      return {
        Tags: result,
        success: true
      };
    },
    async updateTagsBulk(root, args, context, ast) {
      let db = await root.db;
      let { $match } = decontructGraphqlQuery(args.Match, ast, TagMetadata);
      let updates = await getUpdateObject(args.Updates || {}, TagMetadata, { db, dbHelpers, hooksObj, root, args, context, ast });

      if (await processHook(hooksObj, "Tag", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "tags", $match, updates, { multi: true });
      await processHook(hooksObj, "Tag", "afterUpdate", $match, updates, root, args, context, ast);

      return { success: true };
    },
    async deleteTag(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      
      if (await processHook(hooksObj, "Tag", "beforeDelete", $match, root, args, context, ast) === false) {
        return false;
      }
      await dbHelpers.runDelete(db, "tags", $match);
      await processHook(hooksObj, "Tag", "afterDelete", $match, root, args, context, ast);
      return true;
    }
  }
};