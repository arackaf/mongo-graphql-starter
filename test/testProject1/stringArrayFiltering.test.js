import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1", keywords: ["javascript", "development", "coding"] });
  await db.collection("books").insertOne({ title: "Book 2", keywords: ["javascript", "development", "coding"] });
  await db.collection("books").insertOne({ title: "Book 3", keywords: ["c#", "development"] });
  await db.collection("books").insertOne({ title: "Book 4", keywords: ["functional-programming"] });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("String array match 1", async () => {
  await queryAndMatchArray({ query: '{allBooks(keywords: ["c#", "development"]){Books{title}}}', coll: "allBooks", results: [{ title: "Book 3" }] });
});

test("String array_ne match 1", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords_ne: ["c#", "development"], SORT: { title: 1 }){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }, { title: "Book 4" }]
  });
});

test("String array match 2", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords: ["javascript", "development", "coding"], SORT: {title: 1}){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("String array match in", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords_in: [[], ["javascript"], ["c#", "development"]], SORT: {title: 1}){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Book 3" }]
  });
});

test("String array match - order matters", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords: ["development", "c#"]){Books{title}}}',
    coll: "allBooks",
    results: []
  });
});

test("String array match - contains", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords_contains: "development", SORT: {title: 1}){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }, { title: "Book 3" }]
  });
});

test("String array match - contains 2", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords_contains: "c#", SORT: {title: 1}){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Book 3" }]
  });
});

test("String array match - contains any", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords_containsAny: ["c#", "coding"], SORT: {title: 1}){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }, { title: "Book 3" }]
  });
});

test("String array match - contains any", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords_containsAny: ["javascript", "coding"], SORT: {title: 1}){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("String array match - both contains", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords_contains: "javascript", keywords_containsAny: ["coding"], SORT: {title: 1}){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("String array count match", async () => {
  await queryAndMatchArray({
    query: "{allBooks(keywords_count: 2, SORT: {title: 1}){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 3" }]
  });
});

//-------------

test("String bad combo 1", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(keywords_endsWith: "1", keywords_startsWith: "B"){Books{title}}}',
    error: true
  });
});
test("String bad combo 2", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(keywords_endsWith: "1", keywords_textContains: "B"){Books{title}}}',
    error: true
  });
});
test("String bad combo 3", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(keywords_endsWith: "1", keywords_regex: "B"){Books{title}}}',
    error: true
  });
});

test("String bad combo 4", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(keywords_startssWith: "1", keywords_textContains: "B"){Books{title}}}',
    error: true
  });
});
test("String bad combo 5", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(keywords_startsWith: "1", keywords_regex: "B"){Books{title}}}',
    error: true
  });
});

test("String bad combo 6", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(keywords_textContains: "1", keywords_regex: "B"){Books{title}}}',
    error: true
  });
});
