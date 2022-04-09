import { MongoClient } from "mongodb";
import { queryAndMatchArray, runQuery, runMutation, nextConnectionString } from "../testUtil";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createGraphqlSchema } from "../../src/module";
import path from "path";
import glob from "glob";
import fs from "fs";

import * as projectSetupTS from "./projectSetup";
import dotenv from "dotenv";
dotenv.config();

export async function create() {
  await createGraphqlSchema(projectSetupTS, path.resolve("./test/testProject-ts"), {
    typings: path.resolve("./test/testProject-ts/graphql-types.ts")
  });
}

export default async function () {
  try {
    await create();
  } catch (err) {
    console.log("ERROR SPINNING UP PROJECT TS:", err);
    throw err;
  }
}
