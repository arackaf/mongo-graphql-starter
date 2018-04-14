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

// ---------------------------------- Create in cached Main Author --------------------------------------

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

test("Add single - add subject to cachedMainAuthor updates author FK appropriately", async () => {
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

// ---------------------------------- Create in cached Authors Collection --------------------------------------

test("Add single - add subject to cachedAuthors creates subject A", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedAuthors: {name: "New Author", subjects: {name: "Newly Added A"}}}){Book{_id}}`,
    result: "createBook"
  });

  await queryAndMatchArray({
    query: `{allSubjects(name: "Newly Added A"){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "Newly Added A" }]
  });
});

test("Add single - add subject to cachedAuthors creates subject B", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedAuthors: [{name: "New Author", subjects: [{name: "Newly Added A"}]}]}){Book{_id}}`,
    result: "createBook"
  });

  await queryAndMatchArray({
    query: `{allSubjects(name: "Newly Added A"){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "Newly Added A" }]
  });
});

test("Add single - add subject to cachedAuthors updates author appropriated A", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedAuthors: {name: "New Author", subjects: {name: "Newly Added A"}}}){Book{_id}}`,
    result: "createBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{subjectIds, subjects{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ subjectIds: ["" + newSubject._id], subjects: [{ name: "Newly Added A" }] }] }]
  });
});

test("Add single - add subject to cachedAuthors updates author appropriated B", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedAuthors: [{name: "New Author", subjects: [{name: "Newly Added A"}]}]}){Book{_id}}`,
    result: "createBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{subjectIds, subjects{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ subjectIds: ["" + newSubject._id], subjects: [{ name: "Newly Added A" }] }] }]
  });
});

test("Add single - add subject to cachedAuthors plus manual subjectIds push updates author appropriated A", async () => {
  let priorSubject = await runMutation({
    mutation: `createSubject(Subject: {name: "Prior Subject"}){Subject{_id}}`,
    result: "createSubject"
  });

  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedAuthors: {name: "New Author", subjectIds: ["${
      priorSubject._id
    }"] subjects: {name: "Newly Added A"}}}){Book{_id}}`,
    result: "createBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{subjects(SORT: {name: 1}){name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ subjects: [{ name: "Newly Added A" }, { name: "Prior Subject" }] }] }]
  });
});

test("Add single - add subject to cachedAuthors plus manual subjectIds push updates author appropriated B", async () => {
  let priorSubject = await runMutation({
    mutation: `createSubject(Subject: {name: "Prior Subject"}){Subject{_id}}`,
    result: "createSubject"
  });

  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedAuthors: [{name: "New Author", subjectIds: ["${
      priorSubject._id
    }"] subjects: [{name: "Newly Added A"}]}]}){Book{_id}}`,
    result: "createBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{subjects(SORT: {name: 1}){name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ subjects: [{ name: "Newly Added A" }, { name: "Prior Subject" }] }] }]
  });
});

test("Add single - add subject to cachedAuthors plus manual subjectIds push updates author appropriated MIXED A", async () => {
  let priorSubject = await runMutation({
    mutation: `createSubject(Subject: {name: "Prior Subject"}){Subject{_id}}`,
    result: "createSubject"
  });

  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedAuthors: {name: "New Author", subjectIds: ["${
      priorSubject._id
    }"] subjects: [{name: "Newly Added A"}]}}){Book{_id}}`,
    result: "createBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{subjects(SORT: {name: 1}){name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ subjects: [{ name: "Newly Added A" }, { name: "Prior Subject" }] }] }]
  });
});

test("Add single - add subject to cachedAuthors plus manual subjectIds push updates author appropriated MIXED B", async () => {
  let priorSubject = await runMutation({
    mutation: `createSubject(Subject: {name: "Prior Subject"}){Subject{_id}}`,
    result: "createSubject"
  });

  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedAuthors: [{name: "New Author", subjectIds: ["${
      priorSubject._id
    }"] subjects: {name: "Newly Added A"}}]}){Book{_id}}`,
    result: "createBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{subjects(SORT: {name: 1}){name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ subjects: [{ name: "Newly Added A" }, { name: "Prior Subject" }] }] }]
  });
});
