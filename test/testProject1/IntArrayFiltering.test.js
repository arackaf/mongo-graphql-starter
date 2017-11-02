import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  await db.collection("books").insert({ title: "Book 1", editions: [1, 2, 3] });
  await db.collection("books").insert({ title: "Book 2", editions: [1, 2, 3] });
  await db.collection("books").insert({ title: "Book 3", editions: [] });
  await db.collection("books").insert({ title: "Book 4", editions: [1] });
  await db.collection("books").insert({ title: "Book 5", editions: [9] });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Array match 1", async () => {
  await queryAndMatchArray({
    query: "{allBooks(editions: [1, 2, 3]){title}}",
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("Array match 2", async () => {
  await queryAndMatchArray({
    query: "{allBooks(editions: [], SORT: {title: 1}){title}}",
    coll: "allBooks",
    results: [{ title: "Book 3" }]
  });
});

test("Array match in", async () => {
  await queryAndMatchArray({
    query: "{allBooks(editions_in: [[], [1], [44]], SORT: {title: 1}){title}}",
    coll: "allBooks",
    results: [{ title: "Book 3" }, { title: "Book 4" }]
  });
});

test("Array match - order matters", async () => {
  await queryAndMatchArray({
    query: "{allBooks(editions: [3, 2, 1]){title}}",
    coll: "allBooks",
    results: []
  });
});

test("Array match - contains", async () => {
  await queryAndMatchArray({
    query: "{allBooks(editions_contains: 2, SORT: {title: 1}){title}}",
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("Array match - contains 2", async () => {
  await queryAndMatchArray({
    query: "{allBooks(editions_contains: 9, SORT: {title: 1}){title}}",
    coll: "allBooks",
    results: [{ title: "Book 5" }]
  });
});
