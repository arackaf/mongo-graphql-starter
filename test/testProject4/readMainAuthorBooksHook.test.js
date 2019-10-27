import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  let adam = { name: "Adam", birthday: new Date("1982-03-22") };
  let katie = { name: "Katie", birthday: new Date("2009-08-05") };
  let laura = { name: "Laura", birthday: new Date("1974-12-19") };
  let mallory = { name: "Mallory", birthday: new Date("1956-08-02") };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insertOne(person)));

  let book1 = { title: "Book 1", pages: 100, mainAuthorId: "" + adam._id };

  await db.collection("books").insertOne(book1);
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  close();
  db = null;
});

test("Read main author's books - Hook", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "Adam"){Authors{name, mainAuthorBooks(SORT: {title: 1}){title, hookValue}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", mainAuthorBooks: [{ title: "Book 1", hookValue: 1 }] }]
  });
});
