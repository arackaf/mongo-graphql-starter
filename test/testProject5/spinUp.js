import { MongoClient } from "mongodb";
import { queryAndMatchArray, runQuery, runMutation, nextConnectionString } from "../testUtil";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createGraphqlSchema, settings } from "../../src/module";
import path from "path";
import glob from "glob";
import fs from "fs";

import * as projectSetupE from "./projectSetup";

export async function create() {
  await Promise.resolve(
    createGraphqlSchema(projectSetupE, path.resolve("./test/testProject5"), { hooks: path.resolve(__dirname, "./projectSetup_Hooks.js") })
  ).then(() => {
    if (true || process.env.InCI) {
      glob.sync("./test/testProject5/graphQL/**/resolver.js").forEach(f => {
        let newFile = fs.readFileSync(f, { encoding: "utf8" }).replace(/"mongo-graphql-starter"/, `"../../../../src/module"`);
        fs.writeFileSync(f, newFile);
      });
    }
  });
}

export default async function () {
  await create();

  if (process.env.PREFER_LOOKUP) {
    settings.setPreferLookup(true);

    console.log(
      "******************************************************************\n",
      "******************************************************************\n",
      "******************************************************************\n",

      "\nPreferring $lookup\n\n",

      "******************************************************************\n",
      "******************************************************************\n",
      "******************************************************************\n"
    );
  }

  const [{ default: resolvers }, { default: typeDefs }] = await Promise.all([import("./graphQL/resolver"), import("./graphQL/schema")]);

  let db, schema;
  let client = await MongoClient.connect(nextConnectionString(), { useNewUrlParser: true, useUnifiedTopology: true });
  db = client.db(process.env.databaseName || "mongo-graphql-starter");
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  return {
    db,
    schema,
    close: () => client.close(),
    queryAndMatchArray: options => queryAndMatchArray({ schema, db, ...options }),
    runQuery: options => runQuery({ schema, db, ...options }),
    runMutation: options => runMutation({ schema, db, ...options })
  };
}
