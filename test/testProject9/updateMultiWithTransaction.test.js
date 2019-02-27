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

test("Add books in author update", async () => {
  let author = await runMutation({
    mutation: `createAuthor(Author: {name: "Adam" }){Author{_id name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateAuthors(_ids: ["${author._id}"], Updates: {name: "Kill"}, books_ADD: [{title: "Some book"}]){success}`,
    noValidation: true
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam" }]
  });

  await queryAndMatchArray({
    query: `{allBooks{Books{title}}}`,
    coll: "allBooks",
    results: []
  });
});

test("Add mainSubject in author update", async () => {
  let author = await runMutation({
    mutation: `createAuthor(Author: {name: "Adam" }){Author{_id name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateAuthors(_ids: ["${author._id}"], Updates: {name: "Kill", mainSubject_SET: {name: "S1"}}){success}`,
    noValidation: true
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam" }]
  });

  await queryAndMatchArray({
    query: `{allSubjects{Subjects{name}}}`,
    coll: "allSubjects",
    results: []
  });
});

test("Add subject in author update", async () => {
  let author = await runMutation({
    mutation: `createAuthor(Author: {name: "Adam" }){Author{_id name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateAuthors(_ids: ["${author._id}"], Updates: {name: "Kill", subjects_ADD: {name: "S1"}}){success}`,
    noValidation: true
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam" }]
  });

  await queryAndMatchArray({
    query: `{allSubjects{Subjects{name}}}`,
    coll: "allSubjects",
    results: []
  });
});

test("Update author multi - yes transaction", async () => {
  let author = await runMutation({
    mutation: `createAuthor(Author: {name: "Adam" }){Author {_id}}`,
    result: "createAuthor"
  });

  let result = await runMutation({
    mutation: `updateAuthors(_ids: ["${author._id}"], Updates: {name: "New"}){Meta{transaction}}`,
    rawResult: "updateAuthors"
  });

  expect(result).toEqual({ Meta: { transaction: true } });
});
