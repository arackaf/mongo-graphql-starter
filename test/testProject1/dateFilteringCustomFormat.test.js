import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1", createdOnYearOnly: new Date("2004-06-02T01:30:00") });
  await db.collection("books").insertOne({ title: "Book 2", createdOnYearOnly: new Date("2004-06-02T01:30:10") });
  await db.collection("books").insertOne({ title: "Book 3", createdOnYearOnly: new Date("2004-06-02T01:45:00") });
  await db.collection("books").insertOne({ title: "Book 4", createdOnYearOnly: new Date("2004-06-02T02:00:00") });
  await db.collection("books").insertOne({ title: "Book 5", createdOnYearOnly: new Date("2004-06-02T02:30:00") });
  await db.collection("books").insertOne({ title: "Book 6", createdOnYearOnly: new Date("2004-06-02T03:00:00") });
  await db.collection("books").insertOne({ title: "Book 7", createdOnYearOnly: new Date("2004-06-02T03:00:10") });
  await db.collection("books").insertOne({ title: "Book 8", createdOnYearOnly: new Date("2004-06-02T03:00:20") });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Basic date match", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOnYearOnly: "2004-06-02T03:00:10"){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 7" }]
  });
});

test("Date in", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOnYearOnly_in: ["2004-06-02T03:00:09", "2004-06-02T03:00:10", "2004-06-02T03:00:11"]){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 7" }]
  });
});

test("Date lt", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOnYearOnly_lt: "2004-06-02T01:30:10"){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1" }]
  });
});

test("Date lte", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOnYearOnly_lte: "2004-06-02T01:30:10", SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("Date gt", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOnYearOnly_gt: "2004-06-02T03:00:10"){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 8" }]
  });
});

test("Date gte", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOnYearOnly_gte: "2004-06-02T03:00:10", SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 7" }, { title: "Book 8" }]
  });
});
