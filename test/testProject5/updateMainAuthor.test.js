import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;
let adam, katie, laura, mallory, book1, book2, book3;

beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  adam = { name: "Adam", birthday: new Date("1982-03-22") };
  katie = { name: "Katie", birthday: new Date("2009-08-05") };
  laura = { name: "Laura", birthday: new Date("1974-12-19") };
  mallory = { name: "Mallory", birthday: new Date("1956-08-02") };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insert(person)));

  book1 = { title: "Book 1", pages: 100 };
  book2 = { title: "Book 2", pages: 150 };
  book3 = { title: "Book 3", pages: 200 };

  await db.collection("books").insert(book1);
  await db.collection("books").insert(book2);
  await db.collection("books").insert(book3);
});

afterAll(async () => {
  await db.collection("books").remove({});
  await db.collection("authors").remove({});
  db.close();
  db = null;
});

test("Update book's main author", async () => {
  await runMutation({
    mutation: `updateBook(_id: "${book1._id}", Updates: { mainAuthorId: "${adam._id}" }){Book{title}}`,
    result: "updateBook"
  });

  let book = (await db
    .collection("books")
    .find({ _id: book1._id }, { mainAuthorId: 1 })
    .toArray())[0];

  expect(typeof book.mainAuthorId).toBe("object");
});
