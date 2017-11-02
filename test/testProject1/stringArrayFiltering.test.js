import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  await db.collection("books").insert({ title: "Book 1", keywords: ["javascript", "development", "coding"] });
  await db.collection("books").insert({ title: "Book 2", keywords: ["javascript", "development", "coding"] });
  await db.collection("books").insert({ title: "Book 3", keywords: ["c#", "development"] });
  await db.collection("books").insert({ title: "Book 4", keywords: ["functional-programming"] });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("String array match 1", async () => {
  await queryAndMatchArray({ query: '{allBooks(keywords: ["c#", "development"]){title}}', coll: "allBooks", results: [{ title: "Book 3" }] });
});

test("String array match 2", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords: ["javascript", "development", "coding"], SORT: {title: 1}){title}}',
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("String array match in", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords_in: [[], ["javascript"], ["c#", "development"]], SORT: {title: 1}){title}}',
    coll: "allBooks",
    results: [{ title: "Book 3" }]
  });
});

test("String array match - order matters", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords: ["development", "c#"]){title}}',
    coll: "allBooks",
    results: []
  });
});

test("String array match - contains", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords_contains: "development", SORT: {title: 1}){title}}',
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }, { title: "Book 3" }]
  });
});

test("String array match - contains 2", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords_contains: "c#", SORT: {title: 1}){title}}',
    coll: "allBooks",
    results: [{ title: "Book 3" }]
  });
});
