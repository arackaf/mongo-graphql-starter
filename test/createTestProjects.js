import { createGraphqlSchema } from "mongo-graphql-starter";
import projectSetupA from "./projectSetupA";
import projectSetupB from "./projectSetupB";
import projectSetupC from "./projectSetupC";
import projectSetupD from "./projectSetupD";
import projectSetupE from "./projectSetupE";
import projectSetupF from "./projectSetupF";
import projectSetupG from "./projectSetupG";
import projectSetupH from "./projectSetupH";

import mkdirp from "mkdirp";
import path from "path";
import fs from "fs";

createGraphqlSchema(projectSetupA, path.resolve("./test/testProject1"));
createGraphqlSchema(projectSetupB, path.resolve("./test/testProject2"));
createGraphqlSchema(projectSetupC, path.resolve("./test/testProject3"));
createGraphqlSchema(projectSetupD, path.resolve("./test/testProject4"));
createGraphqlSchema(projectSetupE, path.resolve("./test/testProject5"));

Promise.resolve(createGraphqlSchema(projectSetupF, path.resolve("./test/testProject6"))).then(() => {
  fs.writeFileSync(
    path.resolve("./test/testProject6/graphQL/hooks.js"),
    fs.readFileSync(path.resolve(__dirname, "./projectSetupF_Hooks.js"), { encoding: "utf8" })
  );
  if (!fs.existsSync("./test/testProject6/graphQL-extras")) {
    mkdirp.sync("./test/testProject6/graphQL-extras");
  }
  fs.writeFileSync(
    path.resolve("./test/testProject6/graphQL-extras/typeWithExtra.js"),
    fs.readFileSync(path.resolve(__dirname, "./projectSetupF_Extras.js"), { encoding: "utf8" })
  );
});

Promise.resolve(createGraphqlSchema(projectSetupF, path.resolve("./test/testProject7"))).then(() => {
  fs.writeFileSync(
    path.resolve("./test/testProject7/graphQL/hooks.js"),
    fs.readFileSync(path.resolve(__dirname, "./projectSetupG_Hooks.js"), { encoding: "utf8" })
  );
});

createGraphqlSchema(projectSetupH, path.resolve("./test/testProject8"));
