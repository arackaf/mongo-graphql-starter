import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});

  let adamIds = ObjectId("5c266fd9967e9b904df20e7f");
  let katieIds = ObjectId("5c266fdf967e9b904df20e8d");
  let lauraIds = ObjectId("5c266fe0967e9b904df20e90");
  let malloryIds = ObjectId("5c9fc57bfe169e27468db43a");

  let adam = { name: "Adam", birthday: new Date("1982-03-22"), _idsM: [adamIds], _idsS: ["" + adamIds] };
  let katie = { name: "Katie", birthday: new Date("2009-08-05"), _idsM: [katieIds], _idsS: ["" + katieIds] };
  let laura = { name: "Laura", birthday: new Date("1974-12-19"), _idsM: [lauraIds], _idsS: ["" + lauraIds] };
  let mallory = { name: "Mallory", birthday: new Date("1956-08-02"), _idsM: [malloryIds], _idsS: ["" + malloryIds] };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insertOne(person)));

  await db.collection("books").insertOne({ title: `Mallory Book 1`, pages: 100, mainAuthorId: mallory._idsM[0] });
  for (let i = 0; i < 100; i++) {
    for (let person of [adam, katie, laura]) {
      await db.collection("books").insertOne({ title: `${person.name} Book ${i + 1}`, pages: 100 + (i + 1), mainAuthorId: person._idsM[0] });
    }
  }
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  close();
  db = null;
});

test("Read author's books_idsS_Main 1", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "Adam"){Authors{name, books_idsS_Main(PAGE: 1, PAGE_SIZE: 3, FILTER: { pages_gt: 150 }, SORT: {pages: 1}){title}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", books_idsS_Main: [{ title: "Adam Book 51" }, { title: "Adam Book 52" }, { title: "Adam Book 53" }] }]
  });
});

test("Read author's books_idsS_Main 2", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "Adam"){Authors{name, books_idsS_Main(PAGE: 2, PAGE_SIZE: 3, FILTER: { pages_gt: 150 }, SORT: {pages: 1}){title}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", books_idsS_Main: [{ title: "Adam Book 54" }, { title: "Adam Book 55" }, { title: "Adam Book 56" }] }]
  });
});

test("Read author's books_idsS_Main count", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "Adam"){Authors{name, books_idsS_MainMeta{count}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", books_idsS_MainMeta: { count: 100 } }]
  });
});
test("Read author's books_idsS_Main count 2", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "Adam"){Authors{name, books_idsS_MainMeta(FILTER: { title_contains: "0" }){count}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", books_idsS_MainMeta: { count: 10 } }]
  });
});

test("Read author's books_idsS_Main stand-alone", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "Mallory"){Authors{name, books_idsS_Main{title}}}}`,
    coll: "allAuthors",
    results: [{ name: "Mallory", books_idsS_Main: [{ title: "Mallory Book 1" }] }]
  });
});
