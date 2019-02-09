import { MongoClient } from "mongodb";
import { queryAndMatchArray, runQuery, runMutation, nextConnectionString } from "../testUtil";
import { makeExecutableSchema } from "graphql-tools";
import { createGraphqlSchema } from "../../src/module";
import path from "path";
import glob from "glob";
import fs from "fs";

import * as projectSetup9 from "./projectSetup";
import dotenv from "dotenv";
dotenv.config();

export async function create() {
  await Promise.resolve(
    createGraphqlSchema(projectSetup9, path.resolve("./test/testProject9"), { hooks: path.resolve(__dirname, "./projectSetup_Hooks.js") })
  ).then(() => {
    if (true || process.env.InCI) {
      glob.sync("./test/testProject9/graphQL/**/resolver.js").forEach(f => {
        let newFile = fs.readFileSync(f, { encoding: "utf8" }).replace(/"mongo-graphql-starter"/, `"../../../../src/module"`);
        fs.writeFileSync(f, newFile);
      });
    }
  });
}

export default async function() {
  try {
    await create();

    const [{ default: resolvers }, { default: typeDefs }] = await Promise.all([import("./graphQL/resolver"), import("./graphQL/schema")]);

    let db, schema;
    let client = await MongoClient.connect(process.env.Mongo4Addr, { useNewUrlParser: true });
    db = client.db(process.env.databaseName || "mongo-graphql-starter");
    schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

    return {
      db,
      client,
      schema,
      close: () => client.close(),
      queryAndMatchArray: options => queryAndMatchArray({ schema, db, ...options }),
      runQuery: options => runQuery({ schema, db, ...options }),
      runMutation: options => runMutation({ schema, db, client, ...options })
    };
  } catch (err) {
    console.log("ERROR SPINNING UP PROJECT 9:", err);
    throw err;
  }
}
