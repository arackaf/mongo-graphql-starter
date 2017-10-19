import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray } from "../testUtil";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter");
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  await db
    .collection("books")
    .insert({ title: "Book 10", pages: 10, primaryAuthor: { birthday: new Date("2004-06-03"), name: "Adam R" }, strArrs: [["a"], ["b", "c"]] });
  await db
    .collection("books")
    .insert({ title: "Book 100", pages: 100, authors: [{ birthday: new Date("2004-06-02"), name: "Adam" }], strArrs: [["a"], ["b", "c"]] });
  await db.collection("books").insert({ title: "Book 150", pages: 150, authors: [{ birthday: new Date("2000-01-02"), name: "Bob" }] });
  await db
    .collection("books")
    .insert({
      title: "Book 200",
      pages: 200,
      authors: [{ birthday: new Date("2004-03-22"), name: "Adam" }, { birthday: new Date("2002-02-03"), name: "Bob" }]
    });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Fetches primary author", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(pages: 10){title, primaryAuthor { birthday, name }}}",
    coll: "allBooks",
    results: [{ title: "Book 10", primaryAuthor: { birthday: "06/03/2004", name: "Adam R" } }]
  });
});

test("Fetches authors", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(pages: 100){title, authors { birthday, name }}}",
    coll: "allBooks",
    results: [{ title: "Book 100", authors: [{ birthday: "06/02/2004", name: "Adam" }] }]
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
    query: "{allBooks(pages: 100){title, strArrs, authors { birthday, name }}}",
    coll: "allBooks",
    results: [{ title: "Book 100", authors: [{ birthday: "06/02/2004", name: "Adam" }], strArrs: [["a"], ["b", "c"]] }]
  });
});
