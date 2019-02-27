import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, runQuery, queryAndMatchArray, runMutation, close;
let adam, katie, laura, mallory, book1, book2, book3;

beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runQuery, runMutation, close } = await spinUp());
});

afterEach(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  await db.collection("subjects").deleteMany({});
  await db.collection("keywords").deleteMany({});
});

afterAll(async () => {
  close();
  db = null;
});

let idA = "5ba6b5b647a8ffd965a0ee05";

test("Add books in new author", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {name: "Adam", junkId: "${idA}", junkAuthorBooks: [{title: "New Book 1"}], junkAuthorBooksMany: [{title: "New Book 2"}] }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name, junkAuthorBooks{title authorJunkId}, junkAuthorBooksMany{title authorJunkIds}}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "Adam",
        junkAuthorBooks: [{ title: "New Book 1", authorJunkId: idA }],
        junkAuthorBooksMany: [{ title: "New Book 2", authorJunkIds: [idA] }]
      }
    ]
  });

  let book1 = (await db
    .collection("books")
    .find({ title: "New Book 1" }, { authorJunkId: 1 })
    .toArray())[0];
  let book2 = (await db
    .collection("books")
    .find({ title: "New Book 2" }, { authorJunkIds: 1 })
    .toArray())[0];

  expect(typeof book1.authorJunkId).toBe("object");
  expect(typeof book2.authorJunkIds[0]).toBe("object");

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title, authorJunkId, authorJunkIds}}}`,
    coll: "allBooks",
    results: [{ title: "New Book 1", authorJunkId: idA, authorJunkIds: null }, { title: "New Book 2", authorJunkId: null, authorJunkIds: [idA] }] //just one
  });
});
