const { graphql } = require("graphql");
const { makeExecutableSchema } = require("graphql-tools");

const { graphqlAst: { parseRequestedFields }, createGraphqlSchema } = require("../../index");

const { arraysMatch } = require("../testUtils");
const projectSetup = require("./projectSetup");

const path = require("path");
const fs = require("fs");
const del = require("del");

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
