import { MongoClient } from "mongodb";
import { queryAndMatchArray, runMutation, nextConnectionString } from "../testUtil";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

export default async function() {
  let db, schema;
  db = await MongoClient.connect(nextConnectionString());
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  return {
    db,
    schema,
    queryAndMatchArray: options => queryAndMatchArray({ schema, db, ...options }),
    runMutation: options => runMutation({ schema, db, ...options })
  };
}
