import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 100", pages: 100 });
  await db.collection("books").insertOne({ title: "Book 150", pages: 150 });
  await db.collection("books").insertOne({ title: "Book 200", pages: 200 });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Int match", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages: 100){Books{title}}}", coll: "allBooks", results: [{ title: "Book 100" }] });
});

test("Int_ne match", async () => {
  await queryAndMatchArray({
    query: "{allBooks(pages_ne: 100, SORT: { title: 1 }){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 150" }, { title: "Book 200" }]
  });
});

test("Int in", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages_in: [99, 100, 101]){Books{title}}}", coll: "allBooks", results: [{ title: "Book 100" }] });
});

test("Int lt", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages_lt: 101){Books{title}}}", coll: "allBooks", results: [{ title: "Book 100" }] });
});

test("Int lt", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages_lte: 100){Books{title}}}", coll: "allBooks", results: [{ title: "Book 100" }] });
});

test("Int gt", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages_gt: 199){Books{title}}}", coll: "allBooks", results: [{ title: "Book 200" }] });
});

test("Int gte", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages_gte: 200){Books{title}}}", coll: "allBooks", results: [{ title: "Book 200" }] });
});

test("Int lt and gt", async () => {
  await queryAndMatchArray({ query: "{allBooks(pages_lt: 151, pages_gt: 149){Books{title}}}", coll: "allBooks", results: [{ title: "Book 150" }] });
});
