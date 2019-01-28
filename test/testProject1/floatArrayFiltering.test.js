import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1", prices: [1.1, 2.2, 3.3] });
  await db.collection("books").insertOne({ title: "Book 2", prices: [1.1, 2.2, 3.3] });
  await db.collection("books").insertOne({ title: "Book 3", prices: [] });
  await db.collection("books").insertOne({ title: "Book 4", prices: [1.1] });
  await db.collection("books").insertOne({ title: "Book 5", prices: [9.9] });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Array match 1", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices: [1.1, 2.2, 3.3]){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("Array ne match 1", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices_ne: [1.1, 2.2, 3.3], SORT: { title: 1 }){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 3" }, { title: "Book 4" }, { title: "Book 5" }]
  });
});

test("Array match 2", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices: [], SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 3" }]
  });
});

test("Array match in", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices_in: [[], [1.1], [44]], SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 3" }, { title: "Book 4" }]
  });
});

test("Array match - order matters", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices: [3.3, 2.2, 1.1]){Books{title}}}",
    coll: "allBooks",
    results: []
  });
});

test("Array match - contains", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices_contains: 2.2, SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("Array match - contains 2", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices_contains: 9.9, SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 5" }]
  });
});

test("Array match - contains", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices_contains: 2.2, SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("Array match - contains any", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices_containsAny: [2.2, 9.9], SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }, { title: "Book 5" }]
  });
});

test("Array match - both contains", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices_contains: 2.2, prices_containsAny: [9.9], SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }, { title: "Book 5" }]
  });
});

test("Array count match", async () => {
  await queryAndMatchArray({
    query: "{allBooks(prices_count: 3, SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});
