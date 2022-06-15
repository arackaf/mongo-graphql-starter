import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Deletion works", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 2"}){Book{_id}}`,
    result: "createBook"
  });

  await runMutation({
    mutation: `deleteBook(_id: "${obj._id}"){success}`,
    result: "deleteBook"
  });
  await queryAndMatchArray({ schema, db, query: "{allBooks{Books{title}}}", coll: "allBooks", results: [] });
});
