import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});

  let adam = { name: "Adam", birthday: new Date("1982-03-22") };
  let katie = { name: "Katie", birthday: new Date("2009-08-05") };
  let laura = { name: "Laura", birthday: new Date("1974-12-19") };
  let mallory = { name: "Mallory", birthday: new Date("1956-08-02") };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insertOne(person)));

  for (let i = 0; i < 10; i++) {
    await db.collection("books").insertOne({ title: `Adam Book ${i + 1}`, pages: 100, mainAuthorId: "" + adam._id });
    await db.collection("books").insertOne({ title: `Katie Book ${i + 1}`, pages: 100, mainAuthorId: "" + katie._id });
    await db.collection("books").insertOne({ title: `Laura Book ${i + 1}`, pages: 100, mainAuthorId: "" + laura._id });
  }
});


afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  close();
  db = null;
});

test("Read author's books", async () => {});
// test("Read author's books", async () => {
//   await queryAndMatchArray({
//     query: `{allAuthors(name_startsWith: "Adam"){Authors{name, books(SORT: {title: 1}){title}}}}`,
//     coll: "allAuthors",
//     results: [{ name: "Adam", books: [{ title: "Book 1" }, { title: "Book 2" }] }]
//   });
// });
