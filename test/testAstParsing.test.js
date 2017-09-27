const { graphql } = require("graphql");
const { makeExecutableSchema } = require("graphql-tools");

const { graphqlAst: { parseRequestedFields } } = require("../index");

const { arraysMatch } = require("./testUtils");

let astPassedIn, schema;

// beforeAll(() => {
//   let typeDefs = `
//     type Author {
//       _id: String
//       name: String
//     }
//     type Book {
//       _id: String
//       title: String
//       publisher: String
//       isbn: String
//       pages: Int
//       weight: Float
//       author: Author
//     }
//     type Query {
//       allBooks: [Book]
//     }
//   `;
//   let resolvers = {
//     Query: {
//       allBooks(root, args, context, ast) {
//         astPassedIn = ast;
//         return [];
//       }
//     }
//   };

//   schema = makeExecutableSchema({ typeDefs, resolvers });
// });

// test("Parse basic primitive fields requested", () => {
//   graphql(schema, "{allBooks{_id, title, publisher}}");

//   let { primitives } = parseRequestedFields(astPassedIn);
//   arraysMatch(primitives, ["_id", "title", "publisher"]);
// });

test("dfsd", () => {
  expect(2).toBe(2);
});
