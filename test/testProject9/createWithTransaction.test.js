import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, runQuery, queryAndMatchArray, runMutation, close;
let adam, katie, laura, mallory, book1, book2, book3;

beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runQuery, runMutation, close } = await spinUp());
});

beforeEach(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  await db.collection("subjects").deleteMany({});
  await db.collection("keywords").deleteMany({});
});

afterAll(async () => {
  close();
  db = null;
});

test("Add books in new author", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {name: "Adam", books: [{title: "Kill"}] }){Author{name}}`,
    noValidation: true
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name, books{title}}}}`,
    coll: "allAuthors",
    results: []
  });

  await queryAndMatchArray({
    query: `{allBooks{Books{title}}}`,
    coll: "allBooks",
    results: []
  });
});

test("Add books in new author - throw after book insert", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {name: "Adam", books: [{title: "THROW_AFTER"}] }){Author{name}}`,
    noValidation: true
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name, books{title}}}}`,
    coll: "allAuthors",
    results: []
  });

  await queryAndMatchArray({
    query: `{allBooks{Books{title}}}`,
    coll: "allBooks",
    results: []
  });
});

test("Add subjects in new author", async () => {
  let result = await runMutation({
    mutation: `createAuthor(Author: {name: "Kill", subjects: [{name: "subject1"}] }){Author {_id}}`,
    noValidation: true
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name, books{title}}}}`,
    coll: "allAuthors",
    results: []
  });

  await queryAndMatchArray({
    query: `{allSubjects{Subjects{name}}}`,
    coll: "allSubjects",
    results: []
  });
});

test("Add author - no transaction", async () => {
  let result = await runMutation({
    mutation: `createAuthor(Author: {name: "Adam" }){Meta {transaction}}`,
    rawResult: "createAuthor"
  });

  expect(result).toEqual({ Meta: { transaction: false } });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam" }]
  });
});
