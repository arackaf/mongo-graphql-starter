import createGraphqlSchema from "./createGraphqlSchema/createSchema";
export { createGraphqlSchema };

import { graphql } from "graphql";
import { makeExecutableSchema } from "graphql-tools";

import * as parseAst from "./queryUtilities/parseAst";
export { parseAst };

import * as dataTypes from "./createGraphqlSchema/dataTypes";
export { dataTypes };

import * as mongoQueryHelpers from "./queryUtilities/mongoQueryHelpers";
export { mongoQueryHelpers };

import decontructGraphqlQuery from "./queryUtilities/decontructGraphqlQuery";
export { decontructGraphqlQuery };

let astPassedIn, schema;

let typeDefs = `
    type Author {
      _id: String
      name: String
    }
    type Book {
      _id: String
      title: String
      publisher: String
      isbn: String
      pages: Int
      weight: Float
      author: Author
    }
    type Query {
      allBooks: [Book]
    }
  `;
let resolvers = {
  Query: {
    allBooks(root, args, context, ast) {
      debugger;
      let fieldNode = ast.fieldNodes.find(fn => fn.kind == "Field");
      if (fieldNode) {
        let primitives = fieldNode.selectionSet.selections.filter(sel => sel.selectionSet == null).map(sel => sel.name.value);
        let objectSelections = fieldNode.selectionSet.selections.filter(sel => sel.selectionSet == null).map(sel => sel.name.value);

        return { primitives, objectSelections };
      }
      astPassedIn = ast;
      return [];
    }
  }
};

schema = makeExecutableSchema({ typeDefs, resolvers });

graphql(schema, "{allBooks{_id, title, publisher, author { _id, name }}}");
