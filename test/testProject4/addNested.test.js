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
    mutation: `
    createBook(Book: {
      title: "New Book", 
      authors: { 
        name: "New Author 1", 
        subjects: {name: "New Subject 1"} 
      }, 
      mainAuthor: {
        name: "New Author 2", 
        mainSubject: {name: "New Subject 2"}
      }
    }){Book{_id}}`,
    result: "createBook"
  });

  //verify authors created in separate collection
  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "New Author", SORT: {name: 1}){Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "New Author 1" }, { name: "New Author 2" }]
  });

  //verify subjects created in separate collection
  await queryAndMatchArray({
    query: `{allSubjects(name_startsWith: "New Subject", SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "New Subject 1" }, { name: "New Subject 2" }]
  });

  //verify all are appropriately linked
  await queryAndMatchArray({
    query: `{allBooks(_id_in: ["${newBook._id}"]){Books{title, authors{name, subjects{name}}, mainAuthor{name, mainSubject{name}}}}}`,
    coll: "allBooks",
    results: [
      {
        title: "New Book",
        authors: [{ name: "New Author 1", subjects: [{ name: "New Subject 1" }] }],
        mainAuthor: {
          name: "New Author 2",
          mainSubject: { name: "New Subject 2" }
        }
      }
    ]
  });
});

test("Verify fk created types on insert", async () => {
  await runMutation({
    mutation: `
    createBook(Book: {
      title: "New Book", 
      authors: { 
        name: "New Author 1", 
        subjects: {name: "New Subject 1"} 
      }, 
      mainAuthor: {
        name: "New Author 2", 
        mainSubject: {name: "New Subject 2"}
      }
    }){Book{_id}}`,
    result: "createBook"
  });

  let createdBook = (await db
    .collection("books")
    .find({ title: "New Book" })
    .toArray())[0];

  let createdAuthor1 = (await db
    .collection("authors")
    .find({ name: "New Author 1" })
    .toArray())[0];

  let createdAuthor2 = (await db
    .collection("authors")
    .find({ name: "New Author 2" })
    .toArray())[0];

  expect(typeof createdBook.mainAuthorId).toBe("string");
  expect(typeof createdBook.authorIds[0]).toBe("string");

  expect(typeof createdAuthor1.subjectIds[0]).toBe("string");
  expect(typeof createdAuthor2.mainSubjectId).toBe("string");
});

test("Verify fk created types on update", async () => {
  let book = await runMutation({
    mutation: `
    createBook(Book: {
      title: "New Book"
    }){Book{_id}}`,
    result: "createBook"
  });

  await runMutation({
    mutation: `
    updateBook(_id: "${book._id}", Updates: {
      authors_ADD: { 
        name: "New Author 1", 
        subjects: {name: "New Subject 1"} 
      }, 
      mainAuthor_SET: {
        name: "New Author 2", 
        mainSubject: {name: "New Subject 2"}
      }
    }){Book{_id}}`,
    result: "updateBook"
  });

  let createdBook = (await db
    .collection("books")
    .find({ title: "New Book" })
    .toArray())[0];

  let createdAuthor1 = (await db
    .collection("authors")
    .find({ name: "New Author 1" })
    .toArray())[0];

  let createdAuthor2 = (await db
    .collection("authors")
    .find({ name: "New Author 2" })
    .toArray())[0];

  expect(typeof createdBook.mainAuthorId).toBe("string");
  expect(typeof createdBook.authorIds[0]).toBe("string");

  expect(typeof createdAuthor1.subjectIds[0]).toBe("string");
  expect(typeof createdAuthor2.mainSubjectId).toBe("string");
});
