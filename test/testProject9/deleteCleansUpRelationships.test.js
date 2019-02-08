import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, runQuery, queryAndMatchArray, runMutation, close;

let book1 = { title: "book1" };
let book2 = { title: "book2" };
let book3 = { title: "book3" };
let book4 = { title: "book4" };
let author1 = { name: "Adam" };
let author2 = { name: "Laura" };
let author3 = { name: "Katie" };

let subject1 = { name: "S1" };

beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runQuery, runMutation, close } = await spinUp());
});

beforeEach(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  await db.collection("subjects").deleteMany({});
  await db.collection("keywords").deleteMany({});
  delete global.cancelDelete;
  delete global.cancelUpdate;

  await db.collection("subjects").insertMany([subject1]);
  await db.collection("authors").insertMany([author1, author2, author3]);

  book1.authorIds = ["" + author3._id];
  book1.mainAuthorId = "" + author3._id;
  book2.authorIds = ["" + author1._id, "" + author2._id];
  book3.authorIds = ["" + author1._id, "" + author2._id];
  book4.authorIds = ["" + author1._id, "" + author3._id];
  book4.mainAuthorId = "" + author2._id;
  await db.collection("books").insertMany([book1, book2, book3, book4]);
});

afterAll(async () => {
  close();
  db = null;
});

test("authors delete uses a transaction", async () => {
  let result = await runMutation({
    mutation: `deleteAuthor(_id: "${author3._id}") { Meta { transaction } }`,
    result: "deleteAuthor"
  });

  expect(result).toEqual({ Meta: { transaction: true } });
});

test("subjects delete does not use a transaction", async () => {
  let result = await runMutation({
    mutation: `deleteSubject(_id: "${subject1._id}") { Meta { transaction } }`,
    result: "deleteSubject"
  });

  expect(result).toEqual({ Meta: { transaction: false } });
});

test("authors relationship's fk cleaned up on author delete", async () => {
  global.cancelDelete = true;
  await runMutation({
    mutation: `deleteAuthor(_id: "${author3._id}") { success }`,
    noValidation: true
  });

  await queryAndMatchArray({
    query: `{getBook(_id: "${book1._id}"){Book{title, authorIds}}}`,
    coll: "getBook",
    results: { title: "book1", authorIds: ["" + author3._id] }
  });
  await queryAndMatchArray({
    query: `{getBook(_id: "${book4._id}"){Book{title, authorIds}}}`,
    coll: "getBook",
    results: { title: "book4", authorIds: ["" + author1._id, "" + author3._id] }
  });
  await queryAndMatchArray({
    query: `{getBook(_id: "${book3._id}"){Book{title, authorIds}}}`,
    coll: "getBook",
    results: { title: "book3", authorIds: ["" + author1._id, "" + author2._id] }
  });
});

test("mainAuthor relationship's fk cleaned up on author delete", async () => {
  global.cancelDelete = true;
  let result = await runMutation({
    mutation: `deleteAuthor(_id: "${author3._id}") { Meta { transaction } }`,
    noValidation: true
  });

  await queryAndMatchArray({
    query: `{getBook(_id: "${book1._id}"){Book{title, mainAuthorId}}}`,
    coll: "getBook",
    results: { title: "book1", mainAuthorId: "" + author3._id }
  });

  await queryAndMatchArray({
    query: `{getBook(_id: "${book4._id}"){Book{title, mainAuthorId}}}`,
    coll: "getBook",
    results: { title: "book4", mainAuthorId: "" + author2._id }
  });
});

// -------------------------------------------------------------------------

test("authors relationship's fk cleaned up on author delete -- exception on fk $pull", async () => {
  global.cancelUpdate = true;
  await runMutation({
    mutation: `deleteAuthor(_id: "${author3._id}") { success }`,
    noValidation: true
  });

  await queryAndMatchArray({
    query: `{getBook(_id: "${book1._id}"){Book{title, authorIds}}}`,
    coll: "getBook",
    results: { title: "book1", authorIds: ["" + author3._id] }
  });
  await queryAndMatchArray({
    query: `{getBook(_id: "${book4._id}"){Book{title, authorIds}}}`,
    coll: "getBook",
    results: { title: "book4", authorIds: ["" + author1._id, "" + author3._id] }
  });
  await queryAndMatchArray({
    query: `{getBook(_id: "${book3._id}"){Book{title, authorIds}}}`,
    coll: "getBook",
    results: { title: "book3", authorIds: ["" + author1._id, "" + author2._id] }
  });
});

test("mainAuthor relationship's fk cleaned up on author delete -- exception on fk $pull", async () => {
  global.cancelUpdate = true;
  let result = await runMutation({
    mutation: `deleteAuthor(_id: "${author3._id}") { Meta { transaction } }`,
    noValidation: true
  });

  await queryAndMatchArray({
    query: `{getBook(_id: "${book1._id}"){Book{title, mainAuthorId}}}`,
    coll: "getBook",
    results: { title: "book1", mainAuthorId: "" + author3._id }
  });

  await queryAndMatchArray({
    query: `{getBook(_id: "${book4._id}"){Book{title, mainAuthorId}}}`,
    coll: "getBook",
    results: { title: "book4", mainAuthorId: "" + author2._id }
  });
});
