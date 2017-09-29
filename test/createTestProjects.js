import { graphql } from "graphql";
import { makeExecutableSchema } from "graphql-tools";

import { graphqlAst, createGraphqlSchema } from "../index";
const { parseRequestedFields } = graphqlAst;

import projectSetup from "./projectSetupA";

import path from "path";
import fs from "fs";
import del from "del";

try {
  del.sync("test/testProject1/project");
  fs.mkdirSync("test/testProject1/project");
  createGraphqlSchema(projectSetup, path.resolve("./test/testProject1/project"));
} catch (e) {
  console.log(e);
}
