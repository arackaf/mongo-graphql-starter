import { decontructGraphqlQuery, middleware } from "mongo-graphql-starter";
import ${objName} from "./${objName}";

export default {
  Query: {
    async all${objName}s(root, args, context, ast) {
      let db = await root.db;
      return Promise
        .resolve(middleware.process(decontructGraphqlQuery(args, ast, ${objName}), root, args, context, ast))
        .then(({ $match, requestedFields, $project, $sort, $limit, $skip }) => {
          let aggregateItems = [{ $match }, { $project }].concat([
            $sort ? { $sort } : null, 
            $skip != null ? { $skip } : null, 
            $limit != null ? { $limit } : null
          ].filter(item => item));
    
          return Promise.resolve(db.collection("${table}").aggregate(aggregateItems)).then(cursor => cursor.toArray());
        });
    },
    async get${objName}(root, args, context, ast) {
      let db = await root.db,
        { filters, requestedFields, projections } = decontructGraphqlQuery(args, ast, ${objName});

      return await db.collection("${table}").findOne(filters, projections);
    }
  }
};
