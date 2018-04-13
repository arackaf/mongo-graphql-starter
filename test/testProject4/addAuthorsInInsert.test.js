import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation;
let adam, katie, laura, mallory, book1, book2, book3;

beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());
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

test("Add single - add subject to cachedMainAuthor", async () => {
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
