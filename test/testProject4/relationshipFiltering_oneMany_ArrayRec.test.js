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

  for (let i = 0; i < 100; i++) {
    for (let person of [adam, katie, laura, mallory]) {
      await db.collection("books").insertOne({ title: `${person.name} Book ${i + 1}`, pages: 100 + (i + 1), authorIds: ["" + person._id] });
    }
  }
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  close();
  db = null;
});

test("Read author's books 1", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "Adam"){Authors{name, books(PAGE: 1, PAGE_SIZE: 3, FILTER: { pages_gt: 150 }, SORT: {pages: 1}){title}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", books: [{ title: "Adam Book 51" }, { title: "Adam Book 52" }, { title: "Adam Book 53" }] }]
  });
});

test("Read author's books 2", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "Adam"){Authors{name, books(PAGE: 2, PAGE_SIZE: 3, FILTER: { pages_gt: 150 }, SORT: {pages: 1}){title}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", books: [{ title: "Adam Book 54" }, { title: "Adam Book 55" }, { title: "Adam Book 56" }] }]
  });
});

test("Read author's books count", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "Adam"){Authors{name, booksMeta{count}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", booksMeta: { count: 100 } }]
  });
});
test("Read author's books count 2", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "Adam"){Authors{name, booksMeta(FILTER: { title_contains: "0" }){count}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", booksMeta: { count: 10 } }]
  });
});
