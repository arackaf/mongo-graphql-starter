import spinUp from "./spinUp";

import { preprocessor } from "mongo-graphql-starter";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  await db.collection("books").insert({ title: "Book 4", pages: 200 });
  await db.collection("books").insert({ title: "Book 6", pages: 200 });
  await db.collection("books").insert({ title: "Book 5", pages: 200 });
  await db.collection("books").insert({ title: "Book 8", pages: 200 });
  await db.collection("books").insert({ title: "Book 1", pages: 100 });
  await db.collection("books").insert({ title: "Book 2", pages: 150 });
  await db.collection("books").insert({ title: "Book 7", pages: 210 });
  await db.collection("books").insert({ title: "Book 3", pages: 90 });

  preprocessor.use((root, args, context, ast) => {
    args.PAGE = 2;
    args.PAGE_SIZE = 3;
  });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;

  preprocessor.clearAll();
});

test("Paging 1", async () => {
  await queryAndMatchArray({
    query: "{allBooks(SORT: {title: 1}){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 4", pages: 200 }, { title: "Book 5", pages: 200 }, { title: "Book 6", pages: 200 }]
  });
});

test("Paging 2", async () => {
  await queryAndMatchArray({
    query: "{allBooks(SORTS: [{pages: 1}, {title: -1}]){title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 8", pages: 200 }, { title: "Book 6", pages: 200 }, { title: "Book 5", pages: 200 }]
  });
});
