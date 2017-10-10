import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray } from "../testUtil";

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
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Sort test 1", async () => {
  queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORT: {title: 1}){title, pages}}",
    coll: "allBooks",
    results: [
      { title: "Book 1", pages: 100 },
      { title: "Book 2", pages: 150 },
      { title: "Book 3", pages: 90 },
      { title: "Book 4", pages: 200 },
      { title: "Book 5", pages: 200 },
      { title: "Book 6", pages: 200 },
      { title: "Book 7", pages: 210 },
      { title: "Book 8", pages: 200 }
    ]
  });
});
test("Sort test 2", async () => {
  queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(SORT: {title: 1}){title, pages}}",
    coll: "allBooks",
    results: [
      { title: "Book 1", pages: 100 },
      { title: "Book 2", pages: 150 },
      { title: "Book 3", pages: 90 },
      { title: "Book 4", pages: 200 },
      { title: "Book 5", pages: 200 },
      { title: "Book 6", pages: 200 },
      { title: "Book 7", pages: 210 },
      { title: "Book 8", pages: 200 }
    ]
  });
});

// test("Sort test 2", async () => {
//   queryAndMatchArray({
//     schema,
//     db,
//     query: "{allBooks(SORT: {pages: 1}){title, pages}}",
//     coll: "allBooks",
//     results: [
//       { title: "Book 3", pages: 90 },
//       { title: "Book 1", pages: 100 },
//       { title: "Book 2", pages: 150 },
//       { title: "Book 4", pages: 200 },
//       { title: "Book 5", pages: 200 },
//       { title: "Book 6", pages: 200 },
//       { title: "Book 8", pages: 200 },
//       { title: "Book 7", pages: 210 }
//     ]
//   });
// });
