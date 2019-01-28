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

test("Multi update 1", async () => {
  let books = await db
    .collection("books")
    .find({ pages: { $gt: 100 } }, { _id: 1 })
    .toArray();

  let results = await runMutation({
    mutation: `updateBooks(_ids: [${books.map(b => '"' + b._id + '"').join(",")}], Updates: {pages: 99}){Books{pages}}`,
    result: "updateBooks"
  });

  expect(results).toEqual([{ pages: 99 }, { pages: 99 }]);

  await queryAndMatchArray({
    query: "{allBooks(SORT: { title: 1 }){Books{title, pages}}}",
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 99 }, { title: "Book 3", pages: 99 }]
  });
});
