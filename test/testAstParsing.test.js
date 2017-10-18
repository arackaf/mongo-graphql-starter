import { graphql } from "graphql";
import { makeExecutableSchema } from "graphql-tools";

import { queryUtilities } from "../index";
const { parseRequestedFields } = queryUtilities;

let astPassedIn, schema;

beforeAll(() => {
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
        astPassedIn = ast;
        return [];
      }
    }
  };

  schema = makeExecutableSchema({ typeDefs, resolvers });
});

test("Parse basic primitive fields requested", () => {
  graphql(schema, "{allBooks{_id, title, publisher}}");

  let { primitives } = parseRequestedFields(astPassedIn);
  expect(primitives).toEqual(["_id", "title", "publisher"]);
});
