import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1" });
  await db.collection("books").insertOne({ title: "Second Book" });
  await db.collection("books").insertOne({ title: "Title x 1" });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("String match", async () => {
  await queryAndMatchArray({ query: '{allBooks(title: "Book 1"){Books{title}}}', coll: "allBooks", results: [{ title: "Book 1" }] });
});

test("String_ne match", async () => {
  await queryAndMatchArray({
    query: '{allBooks(title_ne: "Book 1", SORT: { title: 1 }){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Second Book" }, { title: "Title x 1" }]
  });
});

test("String in", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title_in: ["X", "Book 1", "Y"]){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Book 1" }]
  });
});

test("String in and ne", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title_in: ["Second Book", "Book 1", "Y"], title_ne: "Book 1"){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Second Book" }]
  });
});

test("String endsWith and ne", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title_endsWith: "1", title_ne: "Book 1"){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Title x 1" }]
  });
});

test("String startsWith", async () => {
  await queryAndMatchArray({ query: '{allBooks(title_startsWith: "B"){Books{title}}}', coll: "allBooks", results: [{ title: "Book 1" }] });
});

test("String endsWith", async () => {
  await queryAndMatchArray({ query: '{allBooks(title_endsWith: "k"){Books{title}}}', coll: "allBooks", results: [{ title: "Second Book" }] });
});

test("String contains", async () => {
  await queryAndMatchArray({ query: '{allBooks(title_contains: "x"){Books{title}}}', coll: "allBooks", results: [{ title: "Title x 1" }] });
});

test("String regex", async () => {
  await queryAndMatchArray({ query: '{allBooks(title_regex: "^sec"){Books{title}}}', coll: "allBooks", results: [{ title: "Second Book" }] });
});

test("String bad combo 1", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title_endsWith: "1", title_startsWith: "B"){Books{title}}}',
    error: true
  });
});
test("String bad combo 2", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title_endsWith: "1", title_contains: "B"){Books{title}}}',
    error: true
  });
});
test("String bad combo 3", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title_endsWith: "1", title_regex: "B"){Books{title}}}',
    error: true
  });
});

test("String bad combo 4", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title_startssWith: "1", title_contains: "B"){Books{title}}}',
    error: true
  });
});
test("String bad combo 5", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title_startsWith: "1", title_regex: "B"){Books{title}}}',
    error: true
  });
});

test("String bad combo 6", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: '{allBooks(title_contains: "1", title_regex: "B"){Books{title}}}',
    error: true
  });
});
