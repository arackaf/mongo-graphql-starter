import { MongoClient } from "mongodb";
import { queryAndMatchArray, runQuery, runMutation, nextConnectionString } from "../testUtil";
import { makeExecutableSchema } from "graphql-tools";
import { createGraphqlSchema } from "../../src/module";
import path from "path";
import glob from "glob";
import fs from "fs";
import mkdirp from "mkdirp";

import * as projectSetupF from "../testProject6/projectSetup";

export async function create() {
  let projectSetupG = { ...projectSetupF };
  projectSetupG.Coordinate = { ...projectSetupG.Coordinate };
  projectSetupG.Coordinate.extras = {
    resolverSources: [
      "../../graphQL-extras/coordinateResolverExtras1",
      "../../graphQL-extras/coordinateResolverExtras2",
      "../../graphQL-extras/coordinateResolverExtras3"
    ],
    schemaSources: ["../../graphQL-extras/coordinateSchemaExtras1", "../../graphQL-extras/coordinateSchemaExtras2"],
    overrides: ["getCoordinate", "updateCoordinate"]
  };

  await Promise.resolve(
    createGraphqlSchema(projectSetupG, path.resolve("./test/testProject7"), { hooks: path.resolve(__dirname, "./projectSetup_Hooks.js") })
  ).then(() => {
    if (!fs.existsSync("./test/testProject7/graphQL-extras")) {
      mkdirp.sync("./test/testProject7/graphQL-extras");
    }
    fs.writeFileSync(
      path.resolve("./test/testProject7/graphQL-extras/coordinateSchemaExtras1.js"),
      fs.readFileSync(path.resolve(__dirname, "./projectSetup_SchemaExtras1.js"), { encoding: "utf8" })
    );
    fs.writeFileSync(
      path.resolve("./test/testProject7/graphQL-extras/coordinateSchemaExtras2.js"),
      fs.readFileSync(path.resolve(__dirname, "./projectSetup_SchemaExtras2.js"), { encoding: "utf8" })
    );
    fs.writeFileSync(
      path.resolve("./test/testProject7/graphQL-extras/coordinateResolverExtras1.js"),
      fs.readFileSync(path.resolve(__dirname, "./projectSetup_ResolverExtras1.js"), { encoding: "utf8" })
    );
    fs.writeFileSync(
      path.resolve("./test/testProject7/graphQL-extras/coordinateResolverExtras2.js"),
      fs.readFileSync(path.resolve(__dirname, "./projectSetup_ResolverExtras2.js"), { encoding: "utf8" })
    );
    fs.writeFileSync(
      path.resolve("./test/testProject7/graphQL-extras/coordinateResolverExtras3.js"),
      fs.readFileSync(path.resolve(__dirname, "./projectSetup_ResolverExtras3.js"), { encoding: "utf8" })
    );

    if (true || process.env.InCI) {
      glob.sync("./test/testProject7/graphQL/**/resolver.js").forEach(f => {
        let newFile = fs.readFileSync(f, { encoding: "utf8" }).replace(/"mongo-graphql-starter"/, `"../../../../src/module"`);
        fs.writeFileSync(f, newFile);
      });
    }
  });
}

export default async function() {
  await create();

  const [{ default: resolvers }, { default: typeDefs }] = await Promise.all([import("./graphQL/resolver"), import("./graphQL/schema")]);

  let db, schema;
  let client = await MongoClient.connect(
    nextConnectionString(),
    { useNewUrlParser: true }
  );
  db = client.db(process.env.databaseName || "mongo-graphql-starter");
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  return {
    db,
    schema,
    close: () => client.close(),
    runQuery: options => runQuery({ schema, db, ...options }),
    queryAndMatchArray: options => queryAndMatchArray({ schema, db, ...options }),
    runMutation: options => runMutation({ schema, db, ...options })
  };
}
