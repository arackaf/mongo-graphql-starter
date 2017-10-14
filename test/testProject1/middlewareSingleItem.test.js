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

  await db.collection("books").insert({ _id: "4", title: "Book 4", pages: 200 });
  await db.collection("books").insert({ _id: "6", title: "Book 6", pages: 200 });
  await db.collection("books").insert({ _id: "5", title: "Book 5", pages: 200 });
  await db.collection("books").insert({ _id: "8", title: "Book 8", pages: 200 });
  await db.collection("books").insert({ _id: "1", title: "Book 1", pages: 100 });
  await db.collection("books").insert({ _id: "2", title: "Book 2", pages: 150 });
  await db.collection("books").insert({ _id: "7", title: "Book 7", pages: 210 });
  await db.collection("books").insert({ _id: "3", title: "Book 3", pages: 90 });

  middleware.use((deconstructedQuery, root, args, context, ast) => {
    deconstructedQuery.$match._id = "2";
  });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;

  middleware.clearAll();
});

test("Test middleware 1", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{getBook{title, pages}}",
    coll: "getBook",
    results: { title: "Book 2", pages: 150 }
  });
});
