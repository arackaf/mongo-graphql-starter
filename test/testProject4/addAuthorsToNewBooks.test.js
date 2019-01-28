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
});

afterAll(async () => {
  close();
  db = null;
});

test("Add single new new author in new book", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", authors: { name: "New Author" }}){Book{_id, title, authors{name}}}`,
    result: "createBook"
  });

  await queryAndMatchArray({
    query: `{allBooks(_id_in: ["${newBook._id}"]){Books{title, authors{name}}}}`,
    coll: "allBooks",
    results: [{ title: "New Book", authors: [{ name: "New Author" }] }]
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "New Author"){Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "New Author" }] //just one
  });
});

test("Add mainAuthor in new book", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", mainAuthor: { name: "New Author" }}){Book{_id, title, mainAuthor{name}}}`,
    result: "createBook"
  });

  await queryAndMatchArray({
    query: `{allBooks(_id_in: ["${newBook._id}"]){Books{title, mainAuthor{name}}}}`,
    coll: "allBooks",
    results: [{ title: "New Book", mainAuthor: { name: "New Author" } }]
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "New Author"){Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "New Author" }] //just one
  });
});

test("Add two new new authors in new book", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", authors: [{ name: "New Author 1" }, { name: "New Author 2" }]}){Book{_id, title, authors{name}}}`,
    result: "createBook"
  });

  await queryAndMatchArray({
    query: `{allBooks(_id_in: ["${newBook._id}"]){Books{title, authors(SORT: {name: 1}){name}}}}`,
    coll: "allBooks",
    results: [{ title: "New Book", authors: [{ name: "New Author 1" }, { name: "New Author 2" }] }]
  });

  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "New Author"){Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "New Author 1" }, { name: "New Author 2" }] //just one
  });
});

test("Add two new new authors in new book", async () => {
  let existingAuthor = await runMutation({
    mutation: `createAuthor(Author: {name: "Adam"}){Author{_id}}`,
    result: "createAuthor"
  });

  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", authorIds: ["${
      existingAuthor._id
    }"] authors: [{ name: "New Author 1" }, { name: "New Author 2" }]}){Book{_id, title, authors{name}}}`,
    result: "createBook"
  });

  await queryAndMatchArray({
    query: `{allBooks(_id_in: ["${newBook._id}"]){Books{title, authors(SORT: {name: 1}){name}}}}`,
    coll: "allBooks",
    results: [{ title: "New Book", authors: [{ name: "Adam" }, { name: "New Author 1" }, { name: "New Author 2" }] }]
  });
});
