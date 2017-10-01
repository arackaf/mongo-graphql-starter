import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray } from "../testUtil";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter");
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  await db.collection("books").insert({ title: "Book 1" });
  await db.collection("books").insert({ title: "Second Book" });
  await db.collection("books").insert({ title: "Title x 1" });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("String match", async () => {
  queryAndMatchArray({ schema, db, query: '{allBooks(title: "Book 1"){title}}', coll: "allBooks", results: [{ title: "Book 1" }] });
});

test("String startsWith", async () => {
  queryAndMatchArray({ schema, db, query: '{allBooks(title_startsWith: "B"){title}}', coll: "allBooks", results: [{ title: "Book 1" }] });
});

test("String endsWith", async () => {
  queryAndMatchArray({ schema, db, query: '{allBooks(title_endsWith: "k"){title}}', coll: "allBooks", results: [{ title: "Second Book" }] });
});

test("String contains", async () => {
  queryAndMatchArray({ schema, db, query: '{allBooks(title_contains: "x"){title}}', coll: "allBooks", results: [{ title: "Title x 1" }] });
});
