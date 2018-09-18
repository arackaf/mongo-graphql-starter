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
  await db.collection("subjects").remove({});
  await db.collection("keywords").remove({});
});

afterAll(async () => {
  db.close();
  db = null;
});

test("Add books in new author", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {name: "Adam", books: [{title: "New Book 1"}] }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name, books{title}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", books: [{ title: "New Book 1" }] }]
  });

  await queryAndMatchArray({
    query: `{allBooks{Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "New Book 1" }] //just one
  });
});

test("Add books entry in new author, and nested objects A", async () => {
  let a = await runMutation({
    mutation: `createAuthor(Author: { name: "adam" }){Author{_id, name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateAuthor(_id: "${a._id}", Updates: {}, books_ADD: [
      {
        title: "New Book 1",
        mainAuthor: {
          name: "ma",
          mainSubject: { name: "ms" },
          subjects: [{ name: "s1" }, { name: "s2" }]
        }
      }
    ]){Author{name}}`,
    result: "updateAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, books{title, mainAuthor {name, mainSubject{name}, subjects(SORT: {name: 1}){name}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        books: [{ title: "New Book 1", mainAuthor: { name: "ma", mainSubject: { name: "ms" }, subjects: [{ name: "s1" }, { name: "s2" }] } }]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }] //just one
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "New Book 1" }] //just one
  });
});
