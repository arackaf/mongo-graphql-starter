import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeEach(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1", pages: 100 });
  await db.collection("books").insertOne({ title: "Book 2", pages: 150 });
  await db.collection("books").insertOne({ title: "Book 3", pages: 200 });
});

afterEach(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Single update", async () => {
  let books = await db
    .collection("books")
    .find({ pages: { $gt: 150 } }, { _id: 1 })
    .toArray();

  let results = await runMutation({
    mutation: `updateBook(_id: "${books[0]._id}", Updates: {pages: 99}){success}`,
    rawResult: "updateBook"
  });

  expect(results).toEqual({ success: true });

  await queryAndMatchArray({
    query: "{allBooks(SORT: { title: 1 }){Books{title, pages}}}",
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 150 }, { title: "Book 3", pages: 99 }]
  });
});

test("Multi update", async () => {
  let books = await db
    .collection("books")
    .find({ pages: { $gt: 100 } }, { _id: 1 })
    .toArray();

  let results = await runMutation({
    mutation: `updateBooks(_ids: [${books.map(b => '"' + b._id + '"').join(",")}], Updates: {pages: 99}){success}`,
    rawResult: "updateBooks"
  });

  expect(results).toEqual({ success: true });

  await queryAndMatchArray({
    query: "{allBooks(SORT: { title: 1 }){Books{title, pages}}}",
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 99 }, { title: "Book 3", pages: 99 }]
  });
});
