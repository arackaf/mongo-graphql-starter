import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray } from "../testUtil";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter");
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  await db.collection("books").insert({ title: "Book 1", createdOnYearOnly: new Date("2004-06-02T01:30:00") });
  await db.collection("books").insert({ title: "Book 2", createdOnYearOnly: new Date("2004-06-02T01:30:10") });
  await db.collection("books").insert({ title: "Book 3", createdOnYearOnly: new Date("2004-06-02T01:45:00") });
  await db.collection("books").insert({ title: "Book 4", createdOnYearOnly: new Date("2004-06-02T02:00:00") });
  await db.collection("books").insert({ title: "Book 5", createdOnYearOnly: new Date("2004-06-02T02:30:00") });
  await db.collection("books").insert({ title: "Book 6", createdOnYearOnly: new Date("2004-06-02T03:00:00") });
  await db.collection("books").insert({ title: "Book 7", createdOnYearOnly: new Date("2004-06-02T03:00:10") });
  await db.collection("books").insert({ title: "Book 8", createdOnYearOnly: new Date("2004-06-02T03:00:20") });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Basic date match", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(createdOnYearOnly: "2004-06-02T03:00:10"){title}}`,
    coll: "allBooks",
    results: [{ title: "Book 7" }]
  });
});

test("Date in", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(createdOnYearOnly_in: ["2004-06-02T03:00:09", "2004-06-02T03:00:10", "2004-06-02T03:00:11"]){title}}`,
    coll: "allBooks",
    results: [{ title: "Book 7" }]
  });
});

test("Date lt", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(createdOnYearOnly_lt: "2004-06-02T01:30:10"){title}}`,
    coll: "allBooks",
    results: [{ title: "Book 1" }]
  });
});

test("Date lte", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(createdOnYearOnly_lte: "2004-06-02T01:30:10", SORT: {title: 1}){title}}`,
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("Date gt", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(createdOnYearOnly_gt: "2004-06-02T03:00:10"){title}}`,
    coll: "allBooks",
    results: [{ title: "Book 8" }]
  });
});

test("Date gte", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(createdOnYearOnly_gte: "2004-06-02T03:00:10", SORT: {title: 1}){title}}`,
    coll: "allBooks",
    results: [{ title: "Book 7" }, { title: "Book 8" }]
  });
});
