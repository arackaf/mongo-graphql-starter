import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 4", pages: 200 });
  await db.collection("books").insertOne({ title: "Book 6", pages: 200 });
  await db.collection("books").insertOne({ title: "Book 5", pages: 200 });
  await db.collection("books").insertOne({ title: "Book 8", pages: 200 });
  await db.collection("books").insertOne({ title: "Book 1", pages: 100 });
  await db.collection("books").insertOne({ title: "Book 2", pages: 150 });
  await db.collection("books").insertOne({ title: "Book 7", pages: 210 });
  await db.collection("books").insertOne({ title: "Book 3", pages: 90 });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Metadata works 1", async () => {
  await queryAndMatchArray({
    query: "{allBooks(SORT: {title: 1}, PAGE: 1, PAGE_SIZE: 5){Books{title}, Meta{count}}}",
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }, { title: "Book 3" }, { title: "Book 4" }, { title: "Book 5" }],
    meta: { count: 8 }
  });
});

test("Metadata works 2", async () => {
  await queryAndMatchArray({
    query: "{allBooks(SORTS: [{pages: 1}, {title: -1}], PAGE: 2, PAGE_SIZE: 7){Books{title, pages}, Meta{count}}}",
    coll: "allBooks",
    results: [{ title: "Book 7", pages: 210 }],
    meta: { count: 8 }
  });
});

test("Metadata works 3", async () => {
  await queryAndMatchArray({
    query: "{allBooks(SORTS: [{pages: 1}, {title: -1}], PAGE: 2, PAGE_SIZE: 7){Meta{count}}}",
    coll: "allBooks",
    meta: { count: 8 }
  });
});

test("Metadata works more results 1", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title: "XXX", PAGE: 1, PAGE_SIZE: 5){Books{title}, Meta{count}}}`,
    coll: "allBooks",
    results: [],
    meta: { count: 0 }
  });
});

test("Metadata works more results 2", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title: "XXX", PAGE: 2, PAGE_SIZE: 7){Books{title, pages}, Meta{count}}}`,
    coll: "allBooks",
    results: [],
    meta: { count: 0 }
  });
});

test("Metadata works more results 3", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title: "XXX", PAGE: 2, PAGE_SIZE: 7){Meta{count}}}`,
    coll: "allBooks",
    meta: { count: 0 }
  });
});
