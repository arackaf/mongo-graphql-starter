import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray } from "../testUtil";

import conn from "./connection";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect(conn);
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  await db
    .collection("books")
    .insert({ title: "Book 100", pages: 100, createdOn: new Date("2004-06-02"), createdOnYearOnly: new Date("2004-06-02") });
  await db
    .collection("books")
    .insert({ title: "Book 150", pages: 150, createdOn: new Date("2004-06-02T01:30:45"), createdOnYearOnly: new Date("2004-06-02T01:30:45") });
  await db
    .collection("books")
    .insert({ title: "Book 200", pages: 200, createdOn: new Date("2004-06-02T01:30:45Z"), createdOnYearOnly: new Date("2004-06-02T01:30:45Z") });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Date display default", async () => {
  await queryAndMatchArray({ schema, db, query: "{allBooks(pages: 100){createdOn}}", coll: "allBooks", results: [{ createdOn: "06/02/2004" }] });
});

test("Date display custom", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(pages: 100){createdOnYearOnly}}",
    coll: "allBooks",
    results: [{ createdOnYearOnly: "2004" }]
  });
});

test("Date display default - override", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(pages: 100, createdOn_format: "%m"){createdOn}}`,
    coll: "allBooks",
    results: [{ createdOn: "06" }]
  });
});

test("Date display custom - override", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: `{allBooks(pages: 100, createdOnYearOnly_format: "%m"){createdOnYearOnly}}`,
    coll: "allBooks",
    results: [{ createdOnYearOnly: "06" }]
  });
});
