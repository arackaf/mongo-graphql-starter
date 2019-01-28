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

test("Bulk update 1", async () => {
  await runMutation({
    mutation: `updateBooksBulk(Match: {pages_gt: 100}, Updates: {pages: 99}){success}`,
    result: "updateBooksBulk"
  });

  await queryAndMatchArray({
    query: "{allBooks(SORT: { title: 1 }){Books{title, pages}}}",
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }, { title: "Book 2", pages: 99 }, { title: "Book 3", pages: 99 }]
  });
});
