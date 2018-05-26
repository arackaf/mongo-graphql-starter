import { MongoClient } from "mongodb";
import { queryAndMatchArray, runQuery, runMutation, nextConnectionString } from "../testUtil";
import { makeExecutableSchema } from "graphql-tools";
import { createGraphqlSchema } from "../../src/module";
import path from "path";
import fs from "fs";
import mkdirp from "mkdirp";

import projectSetupF from "../projectSetupF";

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

  return Promise.resolve(createGraphqlSchema(projectSetupG, path.resolve("./test/testProject7"))).then(() => {
    fs.writeFileSync(
      path.resolve("./test/testProject7/graphQL/hooks.js"),
      fs.readFileSync(path.resolve(__dirname, "../projectSetupG_Hooks.js"), { encoding: "utf8" })
    );

    if (!fs.existsSync("./test/testProject7/graphQL-extras")) {
      mkdirp.sync("./test/testProject7/graphQL-extras");
    }
    fs.writeFileSync(
      path.resolve("./test/testProject7/graphQL-extras/coordinateSchemaExtras1.js"),
      fs.readFileSync(path.resolve(__dirname, "../projectSetupG_SchemaExtras1.js"), { encoding: "utf8" })
    );
    fs.writeFileSync(
      path.resolve("./test/testProject7/graphQL-extras/coordinateSchemaExtras2.js"),
      fs.readFileSync(path.resolve(__dirname, "../projectSetupG_SchemaExtras2.js"), { encoding: "utf8" })
    );
    fs.writeFileSync(
      path.resolve("./test/testProject7/graphQL-extras/coordinateResolverExtras1.js"),
      fs.readFileSync(path.resolve(__dirname, "../projectSetupG_ResolverExtras1.js"), { encoding: "utf8" })
    );
    fs.writeFileSync(
      path.resolve("./test/testProject7/graphQL-extras/coordinateResolverExtras2.js"),
      fs.readFileSync(path.resolve(__dirname, "../projectSetupG_ResolverExtras2.js"), { encoding: "utf8" })
    );
    fs.writeFileSync(
      path.resolve("./test/testProject7/graphQL-extras/coordinateResolverExtras3.js"),
      fs.readFileSync(path.resolve(__dirname, "../projectSetupG_ResolverExtras3.js"), { encoding: "utf8" })
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
