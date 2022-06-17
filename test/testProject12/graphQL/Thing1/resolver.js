import {
  insertUtilities,
  queryUtilities,
  projectUtilities,
  updateUtilities,
  processHook,
  dbHelpers,
  resolverHelpers
} from "mongo-graphql-starter";
import hooksObj from "../hooks";
const runHook = processHook.bind(this, hooksObj, "Thing1");
const { decontructGraphqlQuery, cleanUpResults, dataLoaderId } = queryUtilities;
const { setUpOneToManyRelationships, newObjectFromArgs } = insertUtilities;
const { getMongoProjection, parseRequestedFields } = projectUtilities;
const { getUpdateObject, setUpOneToManyRelationshipsForUpdate } = updateUtilities;
import { ObjectId } from "mongodb";
import Thing1Metadata from "./Thing1";

async function loadThing1s(db, aggregationPipeline, root, args, context, ast) {
  await processHook(hooksObj, "Thing1", "queryPreAggregate", aggregationPipeline, { db, root, args, context, ast });
  let Thing1s = await dbHelpers.runQuery(db, "thing1", aggregationPipeline);
  await processHook(hooksObj, "Thing1", "adjustResults", Thing1s);
  Thing1s.forEach(o => {
    if (o._id) {
      o._id = "" + o._id;
    }
  });
  return cleanUpResults(Thing1s, Thing1Metadata);
}

export const Thing1 = {};

export default {
  Query: {
    async getThing1(root, args, context, ast) {
      let db = await (typeof root.db === "function" ? root.db() : root.db);
      await runHook("queryPreprocess", { db, root, args, context, ast });
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, Thing1Metadata, "Thing1");
      let { aggregationPipeline } = queryPacket;
      await runHook("queryMiddleware", queryPacket, { db, root, args, context, ast });
      let results = await loadThing1s(db, aggregationPipeline, root, args, context, ast, "Thing1");

      return {
        Thing1: results[0] || null
      };
    },
    async allThing1s(root, args, context, ast) {
      let db = await (typeof root.db === "function" ? root.db() : root.db);
      await runHook("queryPreprocess", { db, root, args, context, ast });
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, Thing1Metadata, "Thing1s");
      let { aggregationPipeline } = queryPacket;
      await runHook("queryMiddleware", queryPacket, { db, root, args, context, ast });
      let result = {};

      if (queryPacket.$project) {
        result.Thing1s = await loadThing1s(db, aggregationPipeline, root, args, context, ast);
      }

      if (queryPacket.metadataRequested.size) {
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")) {
          let $match = aggregationPipeline.find(item => item.$match);
          let countResults = await dbHelpers.runQuery(db, "thing1", [
            $match,
            { $group: { _id: null, count: { $sum: 1 } } }
          ]);
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    }
  },
  Mutation: {
    async createThing1(root, args, context, ast) {
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Thing1", Thing1Metadata, {
        create: true
      });
      return await resolverHelpers.runMutation(session, transaction, async () => {
        let newObject = await newObjectFromArgs(args.Thing1, Thing1Metadata, { ...gqlPacket, db, session });
        let requestMap = parseRequestedFields(ast, "Thing1");
        let $project = requestMap.size ? getMongoProjection(requestMap, Thing1Metadata, args) : null;

        newObject = await dbHelpers.processInsertion(db, newObject, {
          ...gqlPacket,
          typeMetadata: Thing1Metadata,
          session
        });
        if (newObject == null) {
          return { Thing1: null, success: false };
        }
        await setUpOneToManyRelationships(newObject, args.Thing1, Thing1Metadata, { ...gqlPacket, db, session });
        await resolverHelpers.mutationComplete(session, transaction);

        let result = $project
          ? (
              await loadThing1s(
                db,
                [{ $match: { _id: newObject._id } }, { $project }, { $limit: 1 }],
                root,
                args,
                context,
                ast
              )
            )[0]
          : null;
        return resolverHelpers.mutationSuccessResult({ Thing1: result, transaction, elapsedTime: 0 });
      });
    },
    async updateThing1(root, args, context, ast) {
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Thing1", Thing1Metadata, {
        update: true
      });
      return await resolverHelpers.runMutation(session, transaction, async () => {
        let { $match, $project } = decontructGraphqlQuery(
          args._id ? { _id: args._id } : {},
          ast,
          Thing1Metadata,
          "Thing1"
        );
        let updates = await getUpdateObject(args.Updates || {}, Thing1Metadata, { ...gqlPacket, db, session });

        if ((await runHook("beforeUpdate", $match, updates, { ...gqlPacket, db, session })) === false) {
          return resolverHelpers.mutationCancelled({ transaction });
        }
        if (!$match._id) {
          throw "No _id sent, or inserted in middleware";
        }
        await setUpOneToManyRelationshipsForUpdate([args._id], args, Thing1Metadata, { ...gqlPacket, db, session });
        await dbHelpers.runUpdate(db, "thing1", $match, updates, { session });
        await runHook("afterUpdate", $match, updates, { ...gqlPacket, db, session });
        await resolverHelpers.mutationComplete(session, transaction);

        let result = $project
          ? (await loadThing1s(db, [{ $match }, { $project }, { $limit: 1 }], root, args, context, ast))[0]
          : null;
        return resolverHelpers.mutationSuccessResult({ Thing1: result, transaction, elapsedTime: 0 });
      });
    },
    async updateThing1s(root, args, context, ast) {
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Thing1", Thing1Metadata, {
        update: true
      });
      return await resolverHelpers.runMutation(session, transaction, async () => {
        let { $match, $project } = decontructGraphqlQuery({ _id_in: args._ids }, ast, Thing1Metadata, "Thing1s");
        let updates = await getUpdateObject(args.Updates || {}, Thing1Metadata, { ...gqlPacket, db, session });

        if ((await runHook("beforeUpdate", $match, updates, { ...gqlPacket, db, session })) === false) {
          return resolverHelpers.mutationCancelled({ transaction });
        }
        await setUpOneToManyRelationshipsForUpdate(args._ids, args, Thing1Metadata, { ...gqlPacket, db, session });
        await dbHelpers.runUpdate(db, "thing1", $match, updates, { session });
        await runHook("afterUpdate", $match, updates, { ...gqlPacket, db, session });
        await resolverHelpers.mutationComplete(session, transaction);

        let result = $project ? await loadThing1s(db, [{ $match }, { $project }], root, args, context, ast) : null;
        return resolverHelpers.mutationSuccessResult({ Thing1s: result, transaction, elapsedTime: 0 });
      });
    },
    async updateThing1sBulk(root, args, context, ast) {
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Thing1", Thing1Metadata, {
        update: true
      });
      return await resolverHelpers.runMutation(session, transaction, async () => {
        let { $match } = decontructGraphqlQuery(args.Match, ast, Thing1Metadata);
        let updates = await getUpdateObject(args.Updates || {}, Thing1Metadata, { ...gqlPacket, db, session });

        if ((await runHook("beforeUpdate", $match, updates, { ...gqlPacket, db, session })) === false) {
          return resolverHelpers.mutationCancelled({ transaction });
        }
        await dbHelpers.runUpdate(db, "thing1", $match, updates, { session });
        await runHook("afterUpdate", $match, updates, { ...gqlPacket, db, session });

        return await resolverHelpers.finishSuccessfulMutation(session, transaction);
      });
    },
    async deleteThing1(root, args, context, ast) {
      if (!args._id) {
        throw "No _id sent";
      }
      let gqlPacket = { root, args, context, ast, hooksObj };
      let { db, session, transaction } = await resolverHelpers.startDbMutation(gqlPacket, "Thing1", Thing1Metadata, {
        delete: true
      });
      try {
        let $match = { _id: ObjectId(args._id) };

        if ((await runHook("beforeDelete", $match, { ...gqlPacket, db, session })) === false) {
          return { success: false };
        }
        await dbHelpers.runDelete(db, "thing1", $match);
        await runHook("afterDelete", $match, { ...gqlPacket, db, session });
        return await resolverHelpers.finishSuccessfulMutation(session, transaction);
      } catch (err) {
        await resolverHelpers.mutationError(err, session, transaction);
        return { success: false };
      } finally {
        resolverHelpers.mutationOver(session);
      }
    }
  }
};
