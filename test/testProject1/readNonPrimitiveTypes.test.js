import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray } from "../testUtil";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter");
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  await db.collection("books").insert({ title: "Book 100", pages: 100, authors: [{ _id: "1", name: "Adam" }], strArrs: [["a"], ["b", "c"]] });
  await db.collection("books").insert({ title: "Book 150", pages: 150, authors: [{ _id: "2", name: "Bob" }] });
  await db.collection("books").insert({ title: "Book 200", pages: 200, authors: [{ _id: "1", name: "Adam" }, { _id: 2, name: "Bob" }] });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Fetches authors", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(pages: 100){title, authors { _id, name }}}",
    coll: "allBooks",
    results: [{ title: "Book 100", authors: [{ _id: "1", name: "Adam" }] }]
  });
});

test("Fetches strArrays", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(pages: 100){title, strArrs}}",
    coll: "allBooks",
    results: [{ title: "Book 100", strArrs: [["a"], ["b", "c"]] }]
  });
});

test("Fetches both", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(pages: 100){title, strArrs, authors { _id, name }}}",
    coll: "allBooks",
    results: [{ title: "Book 100", authors: [{ _id: "1", name: "Adam" }], strArrs: [["a"], ["b", "c"]] }]
  });
});
