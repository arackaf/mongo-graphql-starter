import { MongoClient } from "mongodb";
import { queryAndMatchArray } from "../testUtil";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

const localConn = "mongodb://localhost:27017/mongo-graphql-starter";
let uid = 1;

const nextLocalConn = () => localConn + "-" + uid++;

export default async function() {
  let db, schema;

  db = await MongoClient.connect(nextLocalConn());
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  return {
    db,
    schema,
    queryAndMatchArray: options => queryAndMatchArray({ schema, db, ...options })
  };
}
