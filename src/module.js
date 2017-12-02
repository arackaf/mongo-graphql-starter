import createGraphqlSchema from "./createGraphqlSchema";
export { createGraphqlSchema };

import { graphql } from "graphql";
import { makeExecutableSchema } from "graphql-tools";

import * as dataTypes from "./dataTypes";
export { dataTypes };

import * as queryUtilities from "./queryUtilities";
export { queryUtilities };

export async function processHook(hooks, TypeName, hookName, ...args) {
  let rootHooks = hooks.Root;
  let typeHooks = hooks[TypeName];
  if (rootHooks) {
    if (typeof rootHooks === "function") {
      rootHooks = new rootHooks();
    }
    if (rootHooks[hookName]) {
      await rootHooks[hookName](...args);
    }
  }
  if (typeHooks) {
    if (typeof typeHooks === "function") {
      typeHooks = new typeHooks();
    }
    if (typeHooks[hookName]) {
      await typeHooks[hookName](...args);
    }
  }
}
