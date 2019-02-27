import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
let subject1;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  subject1 = { name: "Subject 1" };
  await Promise.all([subject1].map(subject => db.collection("subjects").insertOne(subject)));

  let adam = { name: "Adam", birthday: new Date("1982-03-22"), subjectIds: ["" + subject1._id] };
  let katie = { name: "Katie", birthday: new Date("2009-08-05") };
  let laura = { name: "Laura", birthday: new Date("1974-12-19") };
  let mallory = { name: "Mallory", birthday: new Date("1956-08-02") };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insertOne(person)));

  let book1 = { title: "Book 1", pages: 100, authorIds: ["" + adam._id], cachedMainAuthor: adam, cachedAuthors: [adam] };
  let book2 = { title: "Book 1 a", pages: 150, authorIds: ["" + adam._id], cachedMainAuthor: adam, cachedAuthors: [adam] };
  let book3 = { title: "Book 2", pages: 200, authorIds: ["" + katie._id] };

  await db.collection("books").insertOne(book1);
  await db.collection("books").insertOne(book2);
  await db.collection("books").insertOne(book3);

  await db.collection("authors").updateOne({ _id: ObjectId(adam._id) }, { $set: { firstBookId: "" + book2._id } });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  await db.collection("subjects").deleteMany({});
  close();
  db = null;
});

test("Read cached authors' subjects with subjectIds manually specified", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "Book 1", SORT: {title: 1}){Books{title, cachedAuthors{name, subjectIds, subjects{name}}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", cachedAuthors: [{ name: "Adam", subjectIds: ["" + subject1._id], subjects: [{ name: "Subject 1" }] }] },
      { title: "Book 1 a", cachedAuthors: [{ name: "Adam", subjectIds: ["" + subject1._id], subjects: [{ name: "Subject 1" }] }] }
    ]
  });
});

test("Read cached authors' subjects with subjectIds not specified", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "Book 1", SORT: {title: 1}){Books{title, cachedAuthors{name, subjects{name}}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", cachedAuthors: [{ name: "Adam", subjects: [{ name: "Subject 1" }] }] },
      { title: "Book 1 a", cachedAuthors: [{ name: "Adam", subjects: [{ name: "Subject 1" }] }] }
    ]
  });
});

//-----------------------------------------------------------------------------------------

test("Read cached authors' subjects with subjectIds manually specified", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "Book 1", SORT: {title: 1}){Books{title, cachedMainAuthor{name, subjectIds, subjects{name}}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", cachedMainAuthor: { name: "Adam", subjectIds: ["" + subject1._id], subjects: [{ name: "Subject 1" }] } },
      { title: "Book 1 a", cachedMainAuthor: { name: "Adam", subjectIds: ["" + subject1._id], subjects: [{ name: "Subject 1" }] } }
    ]
  });
});

test("Read cached authors' subjects with subjectIds not specified", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "Book 1", SORT: {title: 1}){Books{title, cachedMainAuthor{name, subjects{name}}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", cachedMainAuthor: { name: "Adam", subjects: [{ name: "Subject 1" }] } },
      { title: "Book 1 a", cachedMainAuthor: { name: "Adam", subjects: [{ name: "Subject 1" }] } }
    ]
  });
});
