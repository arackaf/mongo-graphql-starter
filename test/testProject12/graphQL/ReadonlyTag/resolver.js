import {
  insertUtilities,
  queryUtilities,
  projectUtilities,
  updateUtilities,
  processHook,
  dbHelpers,
  resolverHelpers
} from "../../../../src/module";
import hooksObj from "../hooks";
const runHook = processHook.bind(this, hooksObj, "ReadonlyTag");
const { decontructGraphqlQuery, cleanUpResults, dataLoaderId } = queryUtilities;
const { setUpOneToManyRelationships, newObjectFromArgs } = insertUtilities;
const { getMongoProjection, parseRequestedFields } = projectUtilities;
const { getUpdateObject, setUpOneToManyRelationshipsForUpdate } = updateUtilities;
import { ObjectId } from "mongodb";
import ReadonlyTagMetadata from "./ReadonlyTag";

async function loadReadonlyTags(db, aggregationPipeline, root, args, context, ast) {
  await processHook(hooksObj, "ReadonlyTag", "queryPreAggregate", aggregationPipeline, {
    db,
    root,
    args,
    context,
    ast
  });
  let ReadonlyTags = await dbHelpers.runQuery(db, "tagsReadonly", aggregationPipeline);
  await processHook(hooksObj, "ReadonlyTag", "adjustResults", ReadonlyTags);
  ReadonlyTags.forEach(o => {
    if (o._id) {
      o._id = "" + o._id;
    }
  });
  return cleanUpResults(ReadonlyTags, ReadonlyTagMetadata);
}

export const ReadonlyTag = {};

export default {
  Query: {
    async getReadonlyTag(root, args, context, ast) {
      let db = await (typeof root.db === "function" ? root.db() : root.db);
      await runHook("queryPreprocess", { db, root, args, context, ast });
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, ReadonlyTagMetadata, "ReadonlyTag");
      let { aggregationPipeline } = queryPacket;
      await runHook("queryMiddleware", queryPacket, { db, root, args, context, ast });
      let results = await loadReadonlyTags(db, aggregationPipeline, root, args, context, ast, "ReadonlyTag");

      return {
        ReadonlyTag: results[0] || null
      };
    },
    async allReadonlyTags(root, args, context, ast) {
      let db = await (typeof root.db === "function" ? root.db() : root.db);
      await runHook("queryPreprocess", { db, root, args, context, ast });
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, ReadonlyTagMetadata, "ReadonlyTags");
      let { aggregationPipeline } = queryPacket;
      await runHook("queryMiddleware", queryPacket, { db, root, args, context, ast });
      let result = {};

      if (queryPacket.$project) {
        result.ReadonlyTags = await loadReadonlyTags(db, aggregationPipeline, root, args, context, ast);
      }

      if (queryPacket.metadataRequested.size) {
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")) {
          let $match = aggregationPipeline.find(item => item.$match);
          let countResults = await dbHelpers.runQuery(db, "tagsReadonly", [
            $match,
            { $group: { _id: null, count: { $sum: 1 } } }
          ]);
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    }
  },
  Mutation: {}
};
