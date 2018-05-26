import { MongoClient } from "mongodb";
import { queryAndMatchArray, runMutation, nextConnectionString } from "../testUtil";
import { makeExecutableSchema } from "graphql-tools";
import { createGraphqlSchema } from "../../src/module";
import path from "path";

import projectSetupC from "./projectSetup";

export async function create() {
  return createGraphqlSchema(projectSetupC, path.resolve("./test/testProject3"));
}

export default async function() {
  await create();

  const [{ default: resolvers }, { default: typeDefs }] = await Promise.all([import("./graphQL/resolver"), import("./graphQL/schema")]);

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
