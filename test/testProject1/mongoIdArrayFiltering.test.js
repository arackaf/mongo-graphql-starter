import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

const id1 = ObjectId("59ff9b246d61043f186dcfed");
const id2 = ObjectId("59ff9b246d61043f186dcfee");
const id3 = ObjectId("59ff9b246d61043f186dcfef");
const idCrap = ObjectId("59ff9b246d61043f186dcfe9");

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1", mongoIds: [id1, id2] });
  await db.collection("books").insertOne({ title: "Book 2", mongoIds: [id3] });
  await db.collection("books").insertOne({ title: "Book 3", mongoIds: [id1, id2, id3] });
  await db.collection("books").insertOne({ title: "Book 4", mongoIds: [] });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("MongoId Array match 1", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoIds: ["${id1}", "${id2}", "${id3}"]){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 3" }]
  });
});

test("MongoId Array match 2", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoIds: [], SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 4" }]
  });
});

test("MongoId Array match in", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoIds_in: [[], ["${idCrap}"]], SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 4" }]
  });
});

test("MongoId Array match in 2", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoIds_in: [[], ["${id3}"]], SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 2" }, { title: "Book 4" }]
  });
});

test("MongoId Array match - order matters", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoIds: ["${id3}", "${id2}", "${id1}"]){Books{title}}}`,
    coll: "allBooks",
    results: []
  });
});

test("MongoId Array match - contains", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoIds_contains: "${id2}", SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 3" }]
  });
});

test("MongoId Array match - contains 2", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoIds_contains: "${id3}", SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 2" }, { title: "Book 3" }]
  });
});
