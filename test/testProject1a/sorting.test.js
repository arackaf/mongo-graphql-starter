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

test("Sort test 1", async () => {
  await queryAndMatchArray({
    query: "{allBooks(SORT: {title: 1}){Books{title, pages}}}",
    coll: "allBooks",
    results: [
      { title: "Book 1", pages: 100 },
      { title: "Book 2", pages: 150 },
      { title: "Book 3", pages: 90 },
      { title: "Book 4", pages: 200 },
      { title: "Book 5", pages: 200 },
      { title: "Book 6", pages: 200 },
      { title: "Book 7", pages: 210 },
      { title: "Book 8", pages: 200 }
    ]
  });
});

test("Sort test 2", async () => {
  await queryAndMatchArray({
    query: "{allBooks(SORTS: [{pages: 1}, {title: 1}]){Books{title, pages}}}",
    coll: "allBooks",
    results: [
      { title: "Book 3", pages: 90 },
      { title: "Book 1", pages: 100 },
      { title: "Book 2", pages: 150 },
      { title: "Book 4", pages: 200 },
      { title: "Book 5", pages: 200 },
      { title: "Book 6", pages: 200 },
      { title: "Book 8", pages: 200 },
      { title: "Book 7", pages: 210 }
    ]
  });
});

test("Sort test 2 a", async () => {
  await queryAndMatchArray({
    query: "{allBooks(SORTS: [{pages: 1}, {title: 1}]){Books{title}}}",
    coll: "allBooks",
    results: [
      { title: "Book 3" },
      { title: "Book 1" },
      { title: "Book 2" },
      { title: "Book 4" },
      { title: "Book 5" },
      { title: "Book 6" },
      { title: "Book 8" },
      { title: "Book 7" }
    ]
  });
});

test("Sort test 3", async () => {
  await queryAndMatchArray({
    query: "{allBooks(SORTS: [{pages: 1}, {title: -1}]){Books{title, pages}}}",
    coll: "allBooks",
    results: [
      { title: "Book 3", pages: 90 },
      { title: "Book 1", pages: 100 },
      { title: "Book 2", pages: 150 },
      { title: "Book 8", pages: 200 },
      { title: "Book 6", pages: 200 },
      { title: "Book 5", pages: 200 },
      { title: "Book 4", pages: 200 },
      { title: "Book 7", pages: 210 }
    ]
  });
});

test("Sort test 4", async () => {
  await queryAndMatchArray({
    query: "{allBooks(SORTS: [{pages: -1}, {title: 1}]){Books{title, pages}}}",
    coll: "allBooks",
    results: [
      { title: "Book 7", pages: 210 },
      { title: "Book 4", pages: 200 },
      { title: "Book 5", pages: 200 },
      { title: "Book 6", pages: 200 },
      { title: "Book 8", pages: 200 },
      { title: "Book 2", pages: 150 },
      { title: "Book 1", pages: 100 },
      { title: "Book 3", pages: 90 }
    ]
  });
});

test("Sort test 5", async () => {
  await queryAndMatchArray({
    query: "{allBooks(SORTS: [{pages: -1}, {title: -1}]){Books{title, pages}}}",
    coll: "allBooks",
    results: [
      { title: "Book 7", pages: 210 },
      { title: "Book 8", pages: 200 },
      { title: "Book 6", pages: 200 },
      { title: "Book 5", pages: 200 },
      { title: "Book 4", pages: 200 },
      { title: "Book 2", pages: 150 },
      { title: "Book 1", pages: 100 },
      { title: "Book 3", pages: 90 }
    ]
  });
});
