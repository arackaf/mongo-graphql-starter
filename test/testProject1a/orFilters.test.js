import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1", pages: 100 });
  await db.collection("books").insertOne({ title: "Second Book", pages: 150 });
  await db.collection("books").insertOne({ title: "Title x 1", pages: 200 });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("OR filters 1", async () => {
  await queryAndMatchArray({
    query: '{allBooks(OR: [{title: "Book 1"}]){Books{title, pages}}}',
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("OR filters 2", async () => {
  await queryAndMatchArray({
    query: '{allBooks(title: "Book 1", OR: [{title: "XXXXXX"}, {title: "Book 1"}]){Books{title, pages}}}',
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("OR filters 3", async () => {
  await queryAndMatchArray({
    query: '{allBooks(title: "Book 1", OR: [{title: "XXXXXX"}, {title: "Book 1", OR: [{pages: 100}]}]){Books{title, pages}}}',
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("OR filters 4", async () => {
  await queryAndMatchArray({
    query: '{allBooks(title: "Book 1", OR: [{title: "XXXXXX"}, {title: "Book 1", OR: [{title: "XXX"}, {pages: 100}]}]){Books{title, pages}}}',
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("OR filters 5 - AND and OR", async () => {
  await queryAndMatchArray({
    query: '{allBooks(title: "Book 1", OR: [{title: "XXXXXX"}, {title: "Book 1", OR: [{pages: 101}]}]){Books{title, pages}}}',
    coll: "allBooks",
    results: []
  });
});
