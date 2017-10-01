import { graphql } from "graphql";
import { makeExecutableSchema } from "graphql-tools";

import { parseAst, createGraphqlSchema } from "../index";
const { parseRequestedFields } = parseAst;

import projectSetup from "./projectSetupA";

import path from "path";
import fs from "fs";
import del from "del";

try {
  del.sync("test/testProject1/graphQL");
  createGraphqlSchema(projectSetup, path.resolve("./test/testProject1"));
} catch (e) {
  console.log(e);
}
