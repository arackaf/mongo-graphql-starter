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
  await db.collection("keywords").deleteMany({});
  await db.collection("subjects").deleteMany({});
});

afterAll(async () => {
  close();
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
