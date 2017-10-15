import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray } from "../testUtil";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter");
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  await db.collection("books").insert({ title: "Book 5.1", weight: 5.1 });
  await db.collection("books").insert({ title: "Book 5.5", weight: 5.5 });
  await db.collection("books").insert({ title: "Book 5.9", weight: 5.9 });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Float match", async () => {
  await queryAndMatchArray({ schema, db, query: "{allBooks(weight: 5.5){title}}", coll: "allBooks", results: [{ title: "Book 5.5" }] });
});

test("Float in", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(weight_in: [5.4, 5.5, 5.6]){title}}",
    coll: "allBooks",
    results: [{ title: "Book 5.5" }]
  });
});

test("Float lt", async () => {
  await queryAndMatchArray({ schema, db, query: "{allBooks(weight_lt: 5.5){title}}", coll: "allBooks", results: [{ title: "Book 5.1" }] });
});

test("Float lts", async () => {
  await queryAndMatchArray({ schema, db, query: "{allBooks(weight_lte: 5.1){title}}", coll: "allBooks", results: [{ title: "Book 5.1" }] });
});

test("Float gt", async () => {
  await queryAndMatchArray({ schema, db, query: "{allBooks(weight_gt: 5.5){title}}", coll: "allBooks", results: [{ title: "Book 5.9" }] });
});

test("Float gte", async () => {
  await queryAndMatchArray({ schema, db, query: "{allBooks(weight_gte: 5.9){title}}", coll: "allBooks", results: [{ title: "Book 5.9" }] });
});
