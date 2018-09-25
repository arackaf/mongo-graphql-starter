import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, runQuery, queryAndMatchArray, runMutation;
let adam, katie, laura, mallory, book1, book2, book3;

beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runQuery, runMutation } = await spinUp());
});

afterEach(async () => {
  await db.collection("books").remove({});
  await db.collection("authors").remove({});
  await db.collection("keywords").remove({});
  await db.collection("subjects").remove({});
});

afterAll(async () => {
  db.close();
  db = null;
});

test("Add subjects in new books in new author", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {name: "Adam", books: [{title: "New Book 1", subjects: [{name: "S1"}]}] }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name, books{title}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", books: [{ title: "New Book 1" }] }]
  });

  await queryAndMatchArray({
    query: `{allSubjects{Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "S1" }]
  });

  await queryAndMatchArray({
    query: `{allBooks{Books{title subjects{name}}}}`,
    coll: "allBooks",
    results: [{ title: "New Book 1", subjects: [{ name: "S1" }] }] //just one
  });
});
