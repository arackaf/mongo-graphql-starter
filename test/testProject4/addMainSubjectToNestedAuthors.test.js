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

// ---------------------------create up front ------------------------------
test("Add single - add subject to cachedMainAuthor creates subject", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedMainAuthor: {name: "New Author", mainSubject: {name: "Newly Added A"}}}){Book{_id}}`,
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
    mutation: `createBook(Book: {title: "New Book", cachedMainAuthor: {name: "New Author", mainSubject: {name: "Newly Added A"}}}){Book{_id}}`,
    result: "createBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedMainAuthor{mainSubjectId, mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedMainAuthor: { mainSubjectId: "" + newSubject._id, mainSubject: { name: "Newly Added A" } } }]
  });
});

// ---------------------------create in Update ------------------------------

test("Add single - add subject to cachedMainAuthor updates author appropriated - Update single", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book"}){Book{_id}}`,
    result: "createBook"
  });

  await runMutation({
    mutation: `updateBook(_id: "${
      newBook._id
    }", Updates: {title: "New Book", cachedMainAuthor: {name: "New Author", mainSubject: {name: "Newly Added A"}}}){Book{_id}}`,
    result: "updateBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedMainAuthor{mainSubjectId, mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedMainAuthor: { mainSubjectId: "" + newSubject._id, mainSubject: { name: "Newly Added A" } } }]
  });
});

test("Add single - add subject to cachedMainAuthor updates author appropriated - Update Multi", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book"}){Book{_id}}`,
    result: "createBook"
  });

  await runMutation({
    mutation: `updateBooks(_ids: ["${
      newBook._id
    }"], Updates: {title: "New Book", cachedMainAuthor: {name: "New Author", mainSubject: {name: "Newly Added A"}}}){Books{_id}}`,
    result: "updateBooks"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedMainAuthor{mainSubjectId, mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedMainAuthor: { mainSubjectId: "" + newSubject._id, mainSubject: { name: "Newly Added A" } } }]
  });
});

test("Add single - add subject to cachedMainAuthor updates author appropriated - Update Bulk", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book"}){Book{_id}}`,
    result: "createBook"
  });

  await runMutation({
    mutation: `updateBooksBulk(Match: { _id_in: ["${
      newBook._id
    }"] }, Updates: {title: "New Book", cachedMainAuthor: {name: "New Author", mainSubject: {name: "Newly Added A"}}}){success}`,
    result: "updateBooksBulk"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedMainAuthor{mainSubjectId, mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedMainAuthor: { mainSubjectId: "" + newSubject._id, mainSubject: { name: "Newly Added A" } } }]
  });
});

// ---------------------------------- Create in cached Authors Collection --------------------------------------

// ----------------------------------- Create up front ---------------------------------------------------------

test("Add single - add subject to cachedAuthors updates author appropriately", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedAuthors: {name: "New Author", mainSubject: {name: "Newly Added A"}}}){Book{_id}}`,
    result: "createBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{mainSubjectId, mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ mainSubjectId: "" + newSubject._id, mainSubject: { name: "Newly Added A" } }] }]
  });
});

test("Add single - add existing subject to cachedAuthors's main subject", async () => {
  let priorSubject = await runMutation({
    mutation: `createSubject(Subject: {name: "Prior Subject"}){Subject{_id}}`,
    result: "createSubject"
  });

  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book", cachedAuthors: {name: "New Author", mainSubjectId: "${priorSubject._id}"}}){Book{_id}}`,
    result: "createBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ mainSubject: { name: "Prior Subject" } }] }]
  });
});

// ----------------------------------- Create in update ---------------------------------------------------------

// ----------------------------------- Create whole array -------------------------------------------------------
test("Add single - add subject to cachedAuthors updates author appropriately", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book"}){Book{_id}}`,
    result: "createBook"
  });

  await runMutation({
    mutation: `updateBook(_id: "${
      newBook._id
    }", Updates: {title: "New Book", cachedAuthors: {name: "New Author", mainSubject: {name: "Newly Added A"}}}){Book{_id}}`,
    result: "updateBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{mainSubjectId, mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ mainSubjectId: "" + newSubject._id, mainSubject: { name: "Newly Added A" } }] }]
  });
});

test("Add single - add existing subject to cachedAuthors's main subject", async () => {
  let priorSubject = await runMutation({
    mutation: `createSubject(Subject: {name: "Prior Subject"}){Subject{_id}}`,
    result: "createSubject"
  });

  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book"}){Book{_id}}`,
    result: "createBook"
  });

  await runMutation({
    mutation: `updateBook(_id: "${newBook._id}", Updates: {title: "New Book", cachedAuthors: {name: "New Author", mainSubjectId: "${
      priorSubject._id
    }"}}){Book{_id}}`,
    result: "updateBook"
  });

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ mainSubject: { name: "Prior Subject" } }] }]
  });
});

// ----------------------------------- Create using push -------------------------------------------------------
test("Add single - add subject to cachedAuthors updates author appropriately", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book"}){Book{_id}}`,
    result: "createBook"
  });

  await runMutation({
    mutation: `updateBook(_id: "${
      newBook._id
    }", Updates: {title: "New Book", cachedAuthors_PUSH: {name: "New Author", mainSubject: {name: "Newly Added A"}}}){Book{_id}}`,
    result: "updateBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{mainSubjectId, mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ mainSubjectId: "" + newSubject._id, mainSubject: { name: "Newly Added A" } }] }]
  });
});

test("Add single - add existing subject to cachedAuthors's main subject", async () => {
  let priorSubject = await runMutation({
    mutation: `createSubject(Subject: {name: "Prior Subject"}){Subject{_id}}`,
    result: "createSubject"
  });

  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book"}){Book{_id}}`,
    result: "createBook"
  });

  await runMutation({
    mutation: `updateBook(_id: "${newBook._id}", Updates: {title: "New Book", cachedAuthors_PUSH: {name: "New Author", mainSubjectId: "${
      priorSubject._id
    }"}}){Book{_id}}`,
    result: "updateBook"
  });

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ mainSubject: { name: "Prior Subject" } }] }]
  });
});

// ----------------------------------- Create using concat -------------------------------------------------------
test("Add single - add subject to cachedAuthors updates author appropriately", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book"}){Book{_id}}`,
    result: "createBook"
  });

  await runMutation({
    mutation: `updateBook(_id: "${
      newBook._id
    }", Updates: {title: "New Book", cachedAuthors_CONCAT: [{name: "New Author", mainSubject: {name: "Newly Added A"}}]}){Book{_id}}`,
    result: "updateBook"
  });

  let newSubject = (await runQuery({
    query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
    coll: "allSubjects"
  })).Subjects[0];

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{mainSubjectId, mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ mainSubjectId: "" + newSubject._id, mainSubject: { name: "Newly Added A" } }] }]
  });
});

test("Add single - add existing subject to cachedAuthors's main subject", async () => {
  let priorSubject = await runMutation({
    mutation: `createSubject(Subject: {name: "Prior Subject"}){Subject{_id}}`,
    result: "createSubject"
  });

  let newBook = await runMutation({
    mutation: `createBook(Book: {title: "New Book"}){Book{_id}}`,
    result: "createBook"
  });

  await runMutation({
    mutation: `updateBook(_id: "${newBook._id}", Updates: {title: "New Book", cachedAuthors_CONCAT: [{name: "New Author", mainSubjectId: "${
      priorSubject._id
    }"}]}){Book{_id}}`,
    result: "updateBook"
  });

  await queryAndMatchArray({
    query: `{allBooks(title: "New Book"){Books{cachedAuthors{mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [{ cachedAuthors: [{ mainSubject: { name: "Prior Subject" } }] }]
  });
});
