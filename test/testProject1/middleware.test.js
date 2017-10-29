import spinUp from "./spinUp";
import { middleware } from "mongo-graphql-starter";

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

  middleware.use((deconstructedQuery, root, args, context, ast) => {
    deconstructedQuery.$match.title = "Book 1";
  });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;

  middleware.clearAll();
});

test("Test middleware 1", async () => {
  await queryAndMatchArray({
    query: "{allBooks{title, pages}}",
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});
