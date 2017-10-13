import { decontructGraphqlQuery } from "mongo-graphql-starter";
import ${objName} from "./${objName}";

export default {
  Query: {
    async all${objName}s(root, args, context, ast) {
      let db = await root.db;
      let { $match, requestedFields, $project, $sort, $limit, $skip } = decontructGraphqlQuery(args, ast, ${objName});

      let aggregateItems = [{ $match }, { $project }].concat([
        $sort ? { $sort } : null, 
        $skip != null ? { $skip } : null, 
        $limit != null ? { $limit } : null
      ].filter(item => item));

      return (await db.collection("${table}").aggregate(aggregateItems)).toArray();
    },
    async get${objName}(root, args, context, ast) {
      let db = await root.db,
        { filters, requestedFields, projections } = decontructGraphqlQuery(args, ast, ${objName});

      return await db.collection("${table}").findOne(filters, projections);
    }
  }
};
