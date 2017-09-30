import { decontructGraphqlQuery } from "mongo-graphql-starter";
import ${objName} from "./${objName}";

export default {
  Query: {
    async all${objName}s(root, args, context, ast) {
      let db = await root.db,
        { filters, requestedFields, projections } = decontructGraphqlQuery(args, ast, ${objName});

      return (await db.collection("${table}").find(filters, projections)).toArray();
    },
    async get${objName}(root, args, context, ast) {
      let db = await root.db,
        { filters, requestedFields, projections } = decontructGraphqlQuery(args, ast, ${objName});

      return await db.collection("${table}").findOne(filters, projections);
    }
  }
};
