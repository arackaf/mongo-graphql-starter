import spinUp from "./spinUp";
import { ObjectId } from "mongodb";
import flatMap from "lodash.flatmap";

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

let updates = [
  { updateName: "updateBook", identify: newBook => `_id: "${newBook._id}"`, result: "{Book{title}}" },
  { updateName: "updateBooks", identify: newBook => `_ids: ["${newBook._id}"]`, result: "{Books{title}}" },
  { updateName: "updateBooksBulk", identify: newBook => `Match: { _id_in: ["${newBook._id}"] }`, result: "{success}" }
];

let configurations = [
  { authorsName: "cachedMainAuthor", authorsOp: "", createWithArray: false, subjectsOp: "" },
  { authorsName: "cachedMainAuthor", authorsOp: "_UPDATE", createWithArray: false, subjectsOp: "_SET" },
  { authorsName: "cachedAuthors", authorsOp: "", createWithArray: false, subjectsOp: "" },
  { authorsName: "cachedAuthors", authorsOp: "", createWithArray: true, subjectsOp: "" },
  { authorsName: "cachedAuthors", authorsOp: "_PUSH", createWithArray: false, subjectsOp: "" },
  { authorsName: "cachedAuthors", authorsOp: "_CONCAT", createWithArray: false, subjectsOp: "" },
  { authorsName: "cachedAuthors", authorsOp: "_CONCAT", createWithArray: true, subjectsOp: "" }
];

let allConfigurations = flatMap(updates, update => configurations.map(config => ({ ...config, ...update })));

allConfigurations.forEach(config => {
  test(`Add single - add subject to ${config.authorsName} updates author ` + JSON.stringify(config), async () => {
    let newBook = await runMutation({
      mutation: `createBook(Book: {title: "New Book"}){Book{_id}}`,
      result: "createBook"
    });

    await runMutation({
      mutation: `${config.updateName}(${config.identify(newBook)}, Updates: {title: "New Book", ${config.authorsName}${config.authorsOp}: ${
        config.createWithArray ? "[" : ""
      }{name: "New Author", mainSubject${config.subjectsOp}: {name: "Newly Added A"}}${config.createWithArray ? "]" : ""}})${config.result}`,
      result: config.updateName
    });

    let newSubject = (await runQuery({
      query: `{allSubjects(name: "Newly Added A"){Subjects{_id, name}}}`,
      coll: "allSubjects"
    })).Subjects[0];

    await queryAndMatchArray({
      query: `{allBooks(title: "New Book"){Books{${config.authorsName}{mainSubjectId, mainSubject{name}}}}}`,
      coll: "allBooks",
      results:
        config.authorsName == "cachedAuthors"
          ? [{ cachedAuthors: [{ mainSubjectId: "" + newSubject._id, mainSubject: { name: "Newly Added A" } }] }]
          : [{ cachedMainAuthor: { mainSubjectId: "" + newSubject._id, mainSubject: { name: "Newly Added A" } } }]
    });
  });

  test(`Add single - add existing subject to ${config.authorsName}'s main subject ` + JSON.stringify(config), async () => {
    let priorSubject = await runMutation({
      mutation: `createSubject(Subject: {name: "Prior Subject"}){Subject{_id}}`,
      result: "createSubject"
    });

    let newBook = await runMutation({
      mutation: `createBook(Book: {title: "New Book"}){Book{_id}}`,
      result: "createBook"
    });

    await runMutation({
      mutation: `${config.updateName}(${config.identify(newBook)}, Updates: {title: "New Book", ${config.authorsName}${config.authorsOp}: ${
        config.createWithArray ? "[" : ""
      }{name: "New Author", mainSubjectId: "${priorSubject._id}"}${config.createWithArray ? "]" : ""}})${config.result}`,
      result: config.updateName
    });

    await queryAndMatchArray({
      query: `{allBooks(title: "New Book"){Books{${config.authorsName}{mainSubject{name}}}}}`,
      coll: "allBooks",
      results:
        config.authorsName == "cachedAuthors"
          ? [{ cachedAuthors: [{ mainSubject: { name: "Prior Subject" } }] }]
          : [{ cachedMainAuthor: { mainSubject: { name: "Prior Subject" } } }]
    });
  });
});
