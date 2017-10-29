import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  await db.collection("books").insert({ title: "Book 1" });
  await db.collection("books").insert({ title: "Second Book" });
  await db.collection("books").insert({ title: "Title x 1" });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("String match", async () => {
  await queryAndMatchArray({ query: '{allBooks(title: "Book 1"){title}}', coll: "allBooks", results: [{ title: "Book 1" }] });
});

test("String in", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title_in: ["X", "Book 1", "Y"]){title}}',
    coll: "allBooks",
    results: [{ title: "Book 1" }]
  });
});

test("String startsWith", async () => {
  await queryAndMatchArray({ query: '{allBooks(title_startsWith: "B"){title}}', coll: "allBooks", results: [{ title: "Book 1" }] });
});

test("String endsWith", async () => {
  await queryAndMatchArray({ query: '{allBooks(title_endsWith: "k"){title}}', coll: "allBooks", results: [{ title: "Second Book" }] });
});

test("String contains", async () => {
  await queryAndMatchArray({ query: '{allBooks(title_contains: "x"){title}}', coll: "allBooks", results: [{ title: "Title x 1" }] });
});
