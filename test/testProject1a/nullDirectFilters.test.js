import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1", pages: 100, weight: 1 });
  await db.collection("books").insertOne({ title: null, pages: 90, weight: 2, isRead: true });
  await db.collection("books").insertOne({ title: "null", pages: null, weight: 3, isRead: true });
  await db.collection("books").insertOne({ title: "w", pages: 12, weight: null, isRead: true });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("String filters null", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      title: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: null, pages: 90 }]
  });
});

test("Int filters null", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      pages: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "null", pages: null }]
  });
});

test("Float filters null", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      weight: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "w", pages: 12 }]
  });
});

test("MongoId filters null", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      mongoId: null
      weight: 1
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("[MongoId] filters null", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      mongoIds: null
      weight: 1
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("ne null 1", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      weight_ne: null
      title_ne: null
      pages_ne: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("ne null 2", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      isRead_ne: null
      weight_ne: null
      pages_ne: null
    ){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 90 }]
  });
});

test("Bool filters null", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      isRead: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});
