import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, close } = await spinUp());

  await db
    .collection("books")
    .insertOne({ title: "Book 1", release: new Date("2004-06-01") });
  await db
    .collection("books")
    .insertOne({ title: "Book 2", release: new Date("2004-06-02") });
  await db
    .collection("books")
    .insertOne({ title: "Book 3", release: new Date("2004-06-03") });
  await db
    .collection("books")
    .insertOne({ title: "Book 4", release: new Date("2004-06-04") });
  await db
    .collection("books")
    .insertOne({ title: "Book 5", release: new Date("2004-06-05") });
  await db
    .collection("books")
    .insertOne({ title: "Book 6", release: new Date("2004-06-06") });
  await db
    .collection("books")
    .insertOne({ title: "Book 7", release: new Date("2004-06-07") });
  await db
    .collection("books")
    .insertOne({ title: "Book 8", release: new Date("2004-06-08") });
});

// afterEach(async () => {
// });

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Basic iso-date match dateFilteringTest", async () => {
  await queryAndMatchArray({
    query: `{allBooks(release: "2004-06-08"){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 8" }]
  });
});

test("Basic iso-date ne match dateFilteringTest", async () => {
  await queryAndMatchArray({
    query: `{allBooks(release_ne: "2004-06-05", SORT: { title: 1 }){Books{title}}}`,
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

test("ISO-Date not in dateFilteringTest", async () => {
  await queryAndMatchArray({
    query: `{allBooks(release_nin: ["2004-06-06", "2004-06-08", "2004-06-10"], SORT: { title: 1 }){Books{title}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1" },
      { title: "Book 2" },
      { title: "Book 3" },
      { title: "Book 4" },
      { title: "Book 5" },
      { title: "Book 7" }
    ]
  });
});

test("ISO-Date in dateFilteringTest", async () => {
  await queryAndMatchArray({
    query: `{allBooks(release_in: ["2004-06-07", "2004-06-02"], SORT: { title: 1 }){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 2" }, { title: "Book 7" }]
  });
});

test("ISO-Date lt dateFilteringTest", async () => {
  const x = await db
    .collection("books")
    .find({})
    .toArray();
  console.log(x);
  await queryAndMatchArray({
    query: `{allBooks(release_lt: "2004-06-02"){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1" }]
  });
});

// test("ISO-Date lte dateFilteringTest", async () => {
//   await queryAndMatchArray({
//     query: `{allBooks(release_lte: "2004-06-02", SORT: {title: 1}){Books{title}}}`,
//     coll: "allBooks",
//     results: [{ title: "Book 1" }, { title: "Book 2" }]
//   });
// });

// test("ISO-Date gt dateFilteringTest", async () => {
//   await queryAndMatchArray({
//     query: `{allBooks(release_gt: "2004-06-07"){Books{title}}}`,
//     coll: "allBooks",
//     results: [{ title: "Book 8" }]
//   });
// });

// test("ISO-Date gte dateFilteringTest", async () => {
//   await queryAndMatchArray({
//     query: `{allBooks(release_gte: "2004-06-07", SORT: {title: 1}){Books{title}}}`,
//     coll: "allBooks",
//     results: [{ title: "Book 7" }, { title: "Book 8" }]
//   });
// });
