import { MongoClient } from "mongodb";
import { queryAndMatchArray, runQuery, runMutation, nextConnectionString } from "../testUtil";
import { makeExecutableSchema } from "graphql-tools";
import { createGraphqlSchema } from "../../src/module";
import path from "path";
import fs from "fs";

import projectSetupD from "./projectSetup";

export async function create() {
  return Promise.resolve(createGraphqlSchema(projectSetupD, path.resolve("./test/testProject4"))).then(() => {
    fs.writeFileSync(
      path.resolve("./test/testProject4/graphQL/hooks.js"),
      fs.readFileSync(path.resolve(__dirname, "./projectSetup_Hooks.js"), { encoding: "utf8" })
    );
  });
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
    runQuery: options => runQuery({ schema, db, ...options }),
    runMutation: options => runMutation({ schema, db, ...options })
  };
}
