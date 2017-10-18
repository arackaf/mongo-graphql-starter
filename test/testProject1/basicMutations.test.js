import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray, runMutation } from "../testUtil";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter");
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Creation mutation runs", async () => {
  await runMutation({ schema, db, mutation: `createBook(title: "Book 1", pages: 100){title, pages}`, result: "createBook" });
});

test("Creation mutation runs and returns object", async () => {
  let obj = await runMutation({ schema, db, mutation: `createBook(title: "Book 2", pages: 100){title, pages}`, result: "createBook" });
  expect(obj).toEqual({ title: "Book 2", pages: 100 });
});

test("Creation mutation runs and returns object, then searched with graphQL", async () => {
  let obj = await runMutation({ schema, db, mutation: `createBook(title: "Book 3", pages: 150){_id}`, result: "createBook" });
  await queryAndMatchArray({
    schema,
    db,
    query: `{getBook(_id: "${obj._id}"){title, pages}}`,
    coll: "getBook",
    results: { title: "Book 3", pages: 150 }
  });
});
