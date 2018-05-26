import { createGraphqlSchema } from "../src/module";

import projectSetupF from "./projectSetupF";
import projectSetupH from "./projectSetupH";

import mkdirp from "mkdirp";
import path from "path";
import fs from "fs";

Promise.resolve(createGraphqlSchema(projectSetupF, path.resolve("./test/testProject6"))).then(() => {
  fs.writeFileSync(
    path.resolve("./test/testProject6/graphQL/hooks.js"),
    fs.readFileSync(path.resolve(__dirname, "./projectSetupF_Hooks.js"), { encoding: "utf8" })
  );
  if (!fs.existsSync("./test/testProject6/graphQL-extras")) {
    mkdirp.sync("./test/testProject6/graphQL-extras");
  }
  fs.writeFileSync(
    path.resolve("./test/testProject6/graphQL-extras/coordinateSchemaExtras.js"),
    fs.readFileSync(path.resolve(__dirname, "./projectSetupF_SchemaExtras.js"), { encoding: "utf8" })
  );
  fs.writeFileSync(
    path.resolve("./test/testProject6/graphQL-extras/coordinateResolverExtras.js"),
    fs.readFileSync(path.resolve(__dirname, "./projectSetupF_ResolverExtras.js"), { encoding: "utf8" })
  );
});

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

Promise.resolve(createGraphqlSchema(projectSetupG, path.resolve("./test/testProject7"))).then(() => {
  fs.writeFileSync(
    path.resolve("./test/testProject7/graphQL/hooks.js"),
    fs.readFileSync(path.resolve(__dirname, "./projectSetupG_Hooks.js"), { encoding: "utf8" })
  );

  if (!fs.existsSync("./test/testProject7/graphQL-extras")) {
    mkdirp.sync("./test/testProject7/graphQL-extras");
  }
  fs.writeFileSync(
    path.resolve("./test/testProject7/graphQL-extras/coordinateSchemaExtras1.js"),
    fs.readFileSync(path.resolve(__dirname, "./projectSetupG_SchemaExtras1.js"), { encoding: "utf8" })
  );
  fs.writeFileSync(
    path.resolve("./test/testProject7/graphQL-extras/coordinateSchemaExtras2.js"),
    fs.readFileSync(path.resolve(__dirname, "./projectSetupG_SchemaExtras2.js"), { encoding: "utf8" })
  );
  fs.writeFileSync(
    path.resolve("./test/testProject7/graphQL-extras/coordinateResolverExtras1.js"),
    fs.readFileSync(path.resolve(__dirname, "./projectSetupG_ResolverExtras1.js"), { encoding: "utf8" })
  );
  fs.writeFileSync(
    path.resolve("./test/testProject7/graphQL-extras/coordinateResolverExtras2.js"),
    fs.readFileSync(path.resolve(__dirname, "./projectSetupG_ResolverExtras2.js"), { encoding: "utf8" })
  );
  fs.writeFileSync(
    path.resolve("./test/testProject7/graphQL-extras/coordinateResolverExtras3.js"),
    fs.readFileSync(path.resolve(__dirname, "./projectSetupG_ResolverExtras3.js"), { encoding: "utf8" })
  );
});

createGraphqlSchema(projectSetupH, path.resolve("./test/testProject8"));
