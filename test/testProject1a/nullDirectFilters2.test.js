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

test("JSON filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      jsonContent: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("Date 1 filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      createdOn: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("Date 2 filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      createdOnYearOnly: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("Custom filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      primaryAuthor: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});

test("[Custom] filters null ignored", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      authors: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 90 }]
  });
});
