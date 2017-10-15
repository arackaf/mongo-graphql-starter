import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray } from "../testUtil";

import { middleware } from "mongo-graphql-starter";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter");
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  await db.collection("books").insert({ title: "Book 4", pages: 200 });
  await db.collection("books").insert({ title: "Book 6", pages: 200 });
  await db.collection("books").insert({ title: "Book 5", pages: 200 });
  await db.collection("books").insert({ title: "Book 8", pages: 200 });
  await db.collection("books").insert({ title: "Book 1", pages: 100 });
  await db.collection("books").insert({ title: "Book 2", pages: 150 });
  await db.collection("books").insert({ title: "Book 7", pages: 210 });
  await db.collection("books").insert({ title: "Book 3", pages: 90 });

  middleware.use((deconstructedQuery, root, args, context, ast) => {
    deconstructedQuery.$match.title = "Book 3";
  });
  middleware.use((deconstructedQuery, root, args, context, ast) => {
    deconstructedQuery.$match.pages = { $lte: args.pages_lte + 1 };
  });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;

  middleware.clearAll();
});

test("Test multiple middleware 1", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(pages_lte: 89){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 3", pages: 90 }]
  });
});
