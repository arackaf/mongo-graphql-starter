import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, close } = await spinUp());

  await db
    .collection("books")
    .insertOne({ title: "Book 100", pages: 100, createdOn: new Date("2004-06-02"), createdOnYearOnly: new Date("2004-06-02") });
  await db
    .collection("books")
    .insertOne({ title: "Book 150", pages: 150, createdOn: new Date("2004-06-02T01:30:45"), createdOnYearOnly: new Date("2004-06-02T01:30:45") });
  await db
    .collection("books")
    .insertOne({ title: "Book 200", pages: 200, createdOn: new Date("2004-06-02T01:30:45Z"), createdOnYearOnly: new Date("2004-06-02T01:30:45Z") });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Date display default", async () => {
  await queryAndMatchArray({
    schema,
    db,
    query: "{allBooks(pages: 100){Books{createdOn}}}",
    coll: "allBooks",
    results: [{ createdOn: "06/02/2004" }]
  });
});

test("Date display custom", async () => {
  await queryAndMatchArray({
    query: "{allBooks(pages: 100){Books{createdOnYearOnly}}}",
    coll: "allBooks",
    results: [{ createdOnYearOnly: "2004" }]
  });
});

test("Date display default - override", async () => {
  await queryAndMatchArray({
    query: `{allBooks(pages: 100, createdOn_format: "%m"){Books{createdOn}}}`,
    coll: "allBooks",
    results: [{ createdOn: "06" }]
  });
});

test("Date display custom - override", async () => {
  await queryAndMatchArray({
    query: `{allBooks(pages: 100, createdOnYearOnly_format: "%m"){Books{createdOnYearOnly}}}`,
    coll: "allBooks",
    results: [{ createdOnYearOnly: "06" }]
  });
});
