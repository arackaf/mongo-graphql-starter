import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1", createdOn: new Date("2004-06-02T01:30:00") });
  await db.collection("books").insertOne({ title: "Book 2", createdOn: new Date("2004-06-02T01:30:10") });
  await db.collection("books").insertOne({ title: "Book 3", createdOn: new Date("2004-06-02T01:45:00") });
  await db.collection("books").insertOne({ title: "Book 4", createdOn: new Date("2004-06-02T02:00:00") });
  await db.collection("books").insertOne({ title: "Book 5", createdOn: new Date("2004-06-02T02:30:00") });
  await db.collection("books").insertOne({ title: "Book 6", createdOn: new Date("2004-06-02T03:00:00") });
  await db.collection("books").insertOne({ title: "Book 7", createdOn: new Date("2004-06-02T03:00:10") });
  await db.collection("books").insertOne({ title: "Book 8", createdOn: new Date("2004-06-02T03:00:20") });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Basic date match dateFilteringTest", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOn: "2004-06-02T03:00:10"){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 7" }]
  });
});

test("Basic date ne match dateFilteringTest", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOn_ne: "2004-06-02T02:30:00", SORT: { title: 1 }){Books{title}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1" },
      { title: "Book 2" },
      { title: "Book 3" },
      { title: "Book 4" },
      { title: "Book 6" },
      { title: "Book 7" },
      { title: "Book 8" }
    ]
  });
});

test("Date in dateFilteringTest", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOn_in: ["2004-06-02T03:00:09", "2004-06-02T03:00:10", "2004-06-02T03:00:11"]){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 7" }]
  });
});

test("Date lt dateFilteringTest", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOn_lt: "2004-06-02T01:30:10"){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1" }]
  });
});

test("Date lte dateFilteringTest", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOn_lte: "2004-06-02T01:30:10", SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }]
  });
});

test("Date gt dateFilteringTest", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOn_gt: "2004-06-02T03:00:10"){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 8" }]
  });
});

test("Date gte dateFilteringTest", async () => {
  await queryAndMatchArray({
    query: `{allBooks(createdOn_gte: "2004-06-02T03:00:10", SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 7" }, { title: "Book 8" }]
  });
});
