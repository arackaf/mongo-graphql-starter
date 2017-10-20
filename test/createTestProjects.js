import { createGraphqlSchema } from "mongo-graphql-starter";
import projectSetupA from "./projectSetupA";
import projectSetupB from "./projectSetupB";

import path from "path";

createGraphqlSchema(projectSetupA, path.resolve("./test/testProject1"));
createGraphqlSchema(projectSetupB, path.resolve("./test/testProject2"));
