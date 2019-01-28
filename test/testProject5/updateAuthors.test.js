import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
let adam, katie, laura, mallory, book1, book2, book3;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  adam = { name: "Adam", birthday: new Date("1982-03-22") };
  katie = { name: "Katie", birthday: new Date("2009-08-05") };
  laura = { name: "Laura", birthday: new Date("1974-12-19") };
  mallory = { name: "Mallory", birthday: new Date("1956-08-02") };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insertOne(person)));

  book1 = { title: "Book 1", pages: 100 };
  book2 = { title: "Book 2", pages: 150 };
  book3 = { title: "Book 3", pages: 200 };

  await db.collection("books").insertOne(book1);
  await db.collection("books").insertOne(book2);
  await db.collection("books").insertOne(book3);
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  close();
  db = null;
});

test("Read authors", async () => {
  await runMutation({
    mutation: `updateBook(_id: "${book1._id}", Updates: { authorIds: ["${adam._id}", "${laura._id}"] }){Book{title}}`,
    result: "updateBook"
  });

  let book = (await db
    .collection("books")
    .find({ _id: book1._id }, { authorIds: 1 })
    .toArray())[0];

  expect(book.authorIds.length).toBe(2);
  expect(typeof book.authorIds[0]).toBe("object");
  expect("" + book.authorIds[0]).toBe(adam._id + "");
  expect(typeof book.authorIds[1]).toBe("object");
  expect("" + book.authorIds[1]).toBe(laura._id + "");
});
