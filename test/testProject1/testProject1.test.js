import { graphql } from "graphql";
import { makeExecutableSchema } from "graphql-tools";

import { graphqlAst, createGraphqlSchema } from "../../index";
const { parseRequestedFields } = graphqlAst;

import { arraysMatch } from "../testUtils";
import projectSetup from "../projectSetupA";

import path from "path";
import fs from "fs";
import del from "del";

let astPassedIn, schema;

beforeAll(() => {
  try {
    del.sync("test/testProject1/project");
  } catch (e) {}
  fs.mkdirSync("test/testProject1/project");
  createGraphqlSchema(projectSetup, path.resolve("./test/testProject1/project"));
});

test("junk", () => {
  expect(1).toBe(1);
});
