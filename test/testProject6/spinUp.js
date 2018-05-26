import { MongoClient } from "mongodb";
import { queryAndMatchArray, runQuery, runMutation, nextConnectionString } from "../testUtil";
import { makeExecutableSchema } from "graphql-tools";
import { createGraphqlSchema } from "../../src/module";
import path from "path";
import fs from "fs";
import mkdirp from "mkdirp";

import projectSetupF from "./projectSetup";

export async function create() {
  return Promise.resolve(createGraphqlSchema(projectSetupF, path.resolve("./test/testProject6"))).then(() => {
    fs.writeFileSync(
      path.resolve("./test/testProject6/graphQL/hooks.js"),
      fs.readFileSync(path.resolve(__dirname, "./projectSetup_Hooks.js"), { encoding: "utf8" })
    );
    if (!fs.existsSync("./test/testProject6/graphQL-extras")) {
      mkdirp.sync("./test/testProject6/graphQL-extras");
    }
    fs.writeFileSync(
      path.resolve("./test/testProject6/graphQL-extras/coordinateSchemaExtras.js"),
      fs.readFileSync(path.resolve(__dirname, "./projectSetup_SchemaExtras.js"), { encoding: "utf8" })
    );
    fs.writeFileSync(
      path.resolve("./test/testProject6/graphQL-extras/coordinateResolverExtras.js"),
      fs.readFileSync(path.resolve(__dirname, "./projectSetup_ResolverExtras.js"), { encoding: "utf8" })
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
    runQuery: options => runQuery({ schema, db, ...options }),
    queryAndMatchArray: options => queryAndMatchArray({ schema, db, ...options }),
    runMutation: options => runMutation({ schema, db, ...options })
  };
}
