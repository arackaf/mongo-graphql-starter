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
});

afterAll(async () => {
  db.close();
  db = null;
});

// --------------------------------- Create Single --------------------------------------------

test("Add single - add single new author in new book", async () => {
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

// ---------------------------------- Create in cached Author --------------------------------------

test("Add single - add subject to cachedMainAuthor creates subject", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedMainAuthor: {name: "New Author", subjects: [{name: "Newly Added A"}]}}){Book{_id}}`,
    result: "createBook"
  });

  await queryAndMatchArray({
    query: `{allSubjects(name: "Newly Added A"){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "Newly Added A" }]
  });
});

test("Add single - add subject to cachedMainAuthor updates author appropriated", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedMainAuthor: {name: "New Author", subjects: [{name: "Newly Added A"}]}}){Book{_id}}`,
    result: "createBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedMainAuthor{subjectIds, subjects{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedMainAuthor: { subjectIds: ["" + newSubject._id], subjects: [{ name: "Newly Added A" }] } }]
  });
});

test("Add single - add subject to cachedMainAuthor plus manual subjectIds push updates author appropriated", async () => {
  let priorSubject = await runMutation({
    mutation: `createSubject(Subject: {name: "Prior Subject"}){Subject{_id}}`,
    result: "createSubject"
  });

  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedMainAuthor: {name: "New Author", subjectIds: ["${
      priorSubject._id
    }"] subjects: [{name: "Newly Added A"}]}}){Book{_id}}`,
    result: "createBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedMainAuthor{subjects(SORT: {name: 1}){name}}}}}`,
    coll: "allBooks",
    results: [{ cachedMainAuthor: { subjects: [{ name: "Newly Added A" }, { name: "Prior Subject" }] } }]
  });
});
