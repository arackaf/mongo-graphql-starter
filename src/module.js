import createGraphqlSchema from "./createGraphqlSchema";
export { createGraphqlSchema };

import { graphql } from "graphql";
import { makeExecutableSchema } from "graphql-tools";

import * as dataTypes from "./dataTypes";
export { dataTypes };

import * as queryUtilities from "./queryUtilities";
export { queryUtilities };

export async function processHook(hooks, TypeName, hookName, ...args) {
  if (hooks[hookName]) {
    await hooks[hookName](...args);
  }
  if (hooks[TypeName] && hooks[TypeName][hookName]) {
    await hooks[TypeName][hookName](...args);
  }
}
