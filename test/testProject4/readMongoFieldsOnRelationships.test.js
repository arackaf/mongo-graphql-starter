import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let ID = "5c266fd9967e9b904df20e7f";
let MongoId = ObjectId(ID);
let keyInfo = { randomMongoId: MongoId, randomMongoIds: [MongoId] };

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  let adam = { name: "Adam", birthday: new Date("1982-03-22"), ...keyInfo };
  let katie = { name: "Katie", birthday: new Date("2009-08-05"), ...keyInfo };

  await Promise.all([adam, katie].map(person => db.collection("authors").insertOne(person)));

  let book1 = { title: "Book 1", pages: 100, mainAuthorId: "" + adam._id, authorIds: ["" + adam._id], ...keyInfo };
  let book2 = { title: "Book 2", pages: 150, mainAuthorId: "" + adam._id, authorIds: ["" + adam._id], ...keyInfo };
  let book3 = { title: "Book 3", pages: 200, mainAuthorId: "" + katie._id, authorIds: ["" + katie._id], ...keyInfo };

  await db.collection("books").insertOne(book1);
  await db.collection("books").insertOne(book2);
  await db.collection("books").insertOne(book3);
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  close();
  db = null;
});

test("Read authors", async () => {
  await queryAndMatchArray({
    query: `{allBooks(SORT: { title: 1 }){Books{title, authors{name, randomMongoId, randomMongoIds }}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", authors: [{ name: "Adam", randomMongoId: ID, randomMongoIds: [ID] }] },
      { title: "Book 2", authors: [{ name: "Adam", randomMongoId: ID, randomMongoIds: [ID] }] },
      { title: "Book 3", authors: [{ name: "Katie", randomMongoId: ID, randomMongoIds: [ID] }] }
    ]
  });
});

test("Read main author", async () => {
  await queryAndMatchArray({
    query: `{allBooks(SORT: { title: 1 }){Books{title, mainAuthor{name, randomMongoId, randomMongoIds }}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", mainAuthor: { name: "Adam", randomMongoId: ID, randomMongoIds: [ID] } },
      { title: "Book 2", mainAuthor: { name: "Adam", randomMongoId: ID, randomMongoIds: [ID] } },
      { title: "Book 3", mainAuthor: { name: "Katie", randomMongoId: ID, randomMongoIds: [ID] } }
    ]
  });
});

test("Read books", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(SORT: { name: 1 }){Authors{name, books(SORT: { title: 1 }){title, randomMongoId, randomMongoIds }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "Adam",
        books: [{ title: "Book 1", randomMongoId: ID, randomMongoIds: [ID] }, { title: "Book 2", randomMongoId: ID, randomMongoIds: [ID] }]
      },
      { name: "Katie", books: [{ title: "Book 3", randomMongoId: ID, randomMongoIds: [ID] }] }
    ]
  });
});

test("Read main author books", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(SORT: { name: 1 }){Authors{name, mainAuthorBooks(SORT: { title: 1 }){title, randomMongoId, randomMongoIds }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "Adam",
        mainAuthorBooks: [{ title: "Book 1", randomMongoId: ID, randomMongoIds: [ID] }, { title: "Book 2", randomMongoId: ID, randomMongoIds: [ID] }]
      },
      { name: "Katie", mainAuthorBooks: [{ title: "Book 3", randomMongoId: ID, randomMongoIds: [ID] }] }
    ]
  });
});
