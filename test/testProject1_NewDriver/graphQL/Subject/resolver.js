import { queryUtilities, processHook, dbHelpers } from "../../../../src/module";
import hooksObj from "../hooks";
const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject, constants } = queryUtilities;
import { ObjectId } from "mongodb";
import SubjectMetadata from "./Subject";

export async function loadSubjects(db, queryPacket, root, args, context, ast) {
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    $sort ? { $sort } : null, 
    { $project },
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item);

  await processHook(hooksObj, "Subject", "queryPreAggregate", aggregateItems, root, args, context, ast);
  let Subjects = await dbHelpers.runQuery(db, "subjects", aggregateItems);
  await processHook(hooksObj, "Subject", "adjustResults", Subjects);
  return Subjects;
}

export const Subject = {


}

export default {
  Query: {
    async getSubject(root, args, context, ast) {
      await processHook(hooksObj, "Subject", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, SubjectMetadata, "Subject");
      await processHook(hooksObj, "Subject", "queryMiddleware", queryPacket, root, args, context, ast);
      let results = await loadSubjects(db, queryPacket, root, args, context, ast);

      return {
        Subject: results[0] || null
      };
    },
    async allSubjects(root, args, context, ast) {
      await processHook(hooksObj, "Subject", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, SubjectMetadata, "Subjects");
      await processHook(hooksObj, "Subject", "queryMiddleware", queryPacket, root, args, context, ast);
      let result = {};

      if (queryPacket.$project) {
        result.Subjects = await loadSubjects(db, queryPacket, root, args, context, ast);
      }

      if (queryPacket.metadataRequested.size) {
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")) {
          let countResults = await dbHelpers.runQuery(db, "subjects", [{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }]);  
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    }
  },
  Mutation: {
    async createSubject(root, args, context, ast) {
      let db = await root.db;
      context.__mongodb = db;
      let newObject = await newObjectFromArgs(args.Subject, SubjectMetadata, { db, dbHelpers, hooksObj, root, args, context, ast });
      let requestMap = parseRequestedFields(ast, "Subject");
      let $project = requestMap.size ? getMongoProjection(requestMap, SubjectMetadata, args) : null;

      if ((newObject = await dbHelpers.processInsertion(db, newObject, { typeMetadata: SubjectMetadata, hooksObj, root, args, context, ast })) == null) {
        return { Subject: null };
      }
      let result = $project ? (await loadSubjects(db, { $match: { _id: newObject._id }, $project, $limit: 1 }, root, args, context, ast))[0] : null;
      return {
        success: true,
        Subject: result
      }
    },
    async updateSubject(root, args, context, ast) {
      let db = await root.db;
      context.__mongodb = db;
      let { $match, $project } = decontructGraphqlQuery(args._id ? { _id: args._id } : {}, ast, SubjectMetadata, "Subject");
      let updates = await getUpdateObject(args.Updates || {}, SubjectMetadata, { db, dbHelpers, hooksObj, root, args, context, ast });

      if (await processHook(hooksObj, "Subject", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { Subject: null };
      }
      if (!$match._id) {
        throw "No _id sent, or inserted in middleware";
      }
      await dbHelpers.runUpdate(db, "subjects", $match, updates);
      await processHook(hooksObj, "Subject", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? (await loadSubjects(db, { $match, $project, $limit: 1 }, root, args, context, ast))[0] : null;
      return {
        Subject: result,
        success: true
      };
    },
    async updateSubjects(root, args, context, ast) {
      let db = await root.db;
      context.__mongodb = db;
      let { $match, $project } = decontructGraphqlQuery({ _id_in: args._ids }, ast, SubjectMetadata, "Subjects");
      let updates = await getUpdateObject(args.Updates || {}, SubjectMetadata, { db, dbHelpers, hooksObj, root, args, context, ast });

      if (await processHook(hooksObj, "Subject", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "subjects", $match, updates, { multi: true });
      await processHook(hooksObj, "Subject", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? await loadSubjects(db, { $match, $project }, root, args, context, ast) : null;
      return {
        Subjects: result,
        success: true
      };
    },
    async updateSubjectsBulk(root, args, context, ast) {
      let db = await root.db;
      let { $match } = decontructGraphqlQuery(args.Match, ast, SubjectMetadata);
      let updates = await getUpdateObject(args.Updates || {}, SubjectMetadata, { db, dbHelpers, hooksObj, root, args, context, ast });

      if (await processHook(hooksObj, "Subject", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "subjects", $match, updates, { multi: true });
      await processHook(hooksObj, "Subject", "afterUpdate", $match, updates, root, args, context, ast);

      return { success: true };
    },
    async deleteSubject(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let db = await root.db;
      let $match = { _id: ObjectId(args._id) };
      
      if (await processHook(hooksObj, "Subject", "beforeDelete", $match, root, args, context, ast) === false) {
        return false;
      }
      await dbHelpers.runDelete(db, "subjects", $match);
      await processHook(hooksObj, "Subject", "afterDelete", $match, root, args, context, ast);
      return true;
    }
  }
};