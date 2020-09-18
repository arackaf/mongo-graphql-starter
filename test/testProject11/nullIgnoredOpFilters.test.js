import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1", pages: 100, weight: 999 });
  await db.collection("books").insertOne({ title: "Book 2", pages: 150, weight: 999 });
  await db.collection("books").insertOne({ title: "Book 3", pages: 90, weight: 999 });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("String filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      title_contains: null
      title_startsWith: null
      title_endsWith: null
      title_regex: null
      title_in: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("Int filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      pages_lt: null
      pages_lte: null
      pages_gt: null
      pages_gte: null
      pages_in: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("Float filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      weight_lt: null
      weight_lte: null
      weight_gt: null
      weight_gte: null
      weight_in: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("Bool filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      isRead_in: null 
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("[String] filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      keywords_count: null
      keywords_textContains: null
      keywords_startsWith: null
      keywords_endsWith: null
      keywords_regex: null
      keywords_in: null
      keywords_contains: null
      keywords_containsAny: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("[Int] filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      editions_count: null
      editions_lt: null
      editions_lte: null
      editions_gt: null
      editions_gte: null
      editions_emlt: null
      editions_emlte: null
      editions_emgt: null
      editions_emgte: null
      editions_in: null
      editions_contains: null
      editions_containsAny: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("[Float] filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      prices_count: null
      prices_lt: null
      prices_lte: null
      prices_gt: null
      prices_gte: null
      prices_emlt: null
      prices_emlte: null
      prices_emgt: null
      prices_emgte: null
      prices_in: null
      prices_contains: null
      prices_containsAny: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("[MongoId] filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      mongoIds_in: null
      mongoIds_contains: null
      mongoIds_containsAny: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("Object filters null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      primaryAuthor: null
      ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("[Object] filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      authors_count: null
      ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("Date filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
        SORT: {title: 1}, 
        createdOn_lt: null
        createdOn_lte: null
        createdOn_gt: null
        createdOn_gte: null
        createdOn_in: null
        createdOnYearOnly_lt: null
        createdOnYearOnly_lte: null
        createdOnYearOnly_gt: null
        createdOnYearOnly_gte: null
        createdOnYearOnly_in: null
      ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("JSON filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
        SORT: {title: 1}, 
        jsonContent_in: null
      ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});
