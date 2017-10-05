import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray } from "../testUtil";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter");
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  await db.collection("books").insert({ title: "Book 1", pages: 100 });
  await db.collection("books").insert({ title: "Second Book", pages: 150 });
  await db.collection("books").insert({ title: "Title x 1", pages: 200 });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("OR filters 1", async () => {
  queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(OR: [{title: "Book 1"}]){title, pages}}',
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("OR filters 2", async () => {
  queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title: "Book 1", OR: [{title: "XXXXXX"}, {title: "Book 1"}]){title, pages}}',
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("OR filters 3", async () => {
  queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title: "Book 1", OR: [{title: "XXXXXX"}, {title: "Book 1", OR: [{pages: 100}]}]){title, pages}}',
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("OR filters 4", async () => {
  queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title: "Book 1", OR: [{title: "XXXXXX"}, {title: "Book 1", OR: [{title: "XXX"}, {pages: 100}]}]){title, pages}}',
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("OR filters 5 - AND and OR", async () => {
  queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title: "Book 1", OR: [{title: "XXXXXX"}, {title: "Book 1", OR: [{pages: 101}]}]){title, pages}}',
    coll: "allBooks",
    results: []
  });
});
