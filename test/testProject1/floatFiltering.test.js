import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 5.1", weight: 5.1 });
  await db.collection("books").insertOne({ title: "Book 5.5", weight: 5.5 });
  await db.collection("books").insertOne({ title: "Book 5.9", weight: 5.9 });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Float match", async () => {
  await queryAndMatchArray({ schema, db, query: "{allBooks(weight: 5.5){Books{title}}}", coll: "allBooks", results: [{ title: "Book 5.5" }] });
});

test("Float ne", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(weight_ne: 5.5, SORT: { title: 1 }){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 5.1" }, { title: "Book 5.9" }]
  });
});

test("Float in", async () => {
  await queryAndMatchArray({
    query: "{allBooks(weight_in: [5.4, 5.5, 5.6]){Books{title}}}",
    coll: "allBooks",
    results: [{ title: "Book 5.5" }]
  });
});

test("Float lt", async () => {
  await queryAndMatchArray({ query: "{allBooks(weight_lt: 5.5){Books{title}}}", coll: "allBooks", results: [{ title: "Book 5.1" }] });
});

test("Float lts", async () => {
  await queryAndMatchArray({ query: "{allBooks(weight_lte: 5.1){Books{title}}}", coll: "allBooks", results: [{ title: "Book 5.1" }] });
});

test("Float gt", async () => {
  await queryAndMatchArray({ query: "{allBooks(weight_gt: 5.5){Books{title}}}", coll: "allBooks", results: [{ title: "Book 5.9" }] });
});

test("Float gte", async () => {
  await queryAndMatchArray({ query: "{allBooks(weight_gte: 5.9){Books{title}}}", coll: "allBooks", results: [{ title: "Book 5.9" }] });
});
