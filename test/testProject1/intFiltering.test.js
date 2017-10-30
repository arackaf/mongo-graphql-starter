import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  await db.collection("books").insert({ title: "Book 100", pages: 100 });
  await db.collection("books").insert({ title: "Book 150", pages: 150 });
  await db.collection("books").insert({ title: "Book 200", pages: 200 });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Int match", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages: 100){title}}", coll: "allBooks", results: [{ title: "Book 100" }] });
});

test("Int in", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages_in: [99, 100, 101]){title}}", coll: "allBooks", results: [{ title: "Book 100" }] });
});

test("Int lt", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages_lt: 101){title}}", coll: "allBooks", results: [{ title: "Book 100" }] });
});

test("Int lts", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages_lte: 100){title}}", coll: "allBooks", results: [{ title: "Book 100" }] });
});

test("Int gt", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages_gt: 199){title}}", coll: "allBooks", results: [{ title: "Book 200" }] });
});

test("Int gte", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages_gte: 200){title}}", coll: "allBooks", results: [{ title: "Book 200" }] });
});
