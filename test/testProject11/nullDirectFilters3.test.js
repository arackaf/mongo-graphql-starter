import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let mongoId = ObjectId("5c266fd9967e9b904df20e7f");
let mongoIds = [ObjectId("5c266fd9967e9b904df20e7f")];

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "XXX", pages: 100, weight: 999, mongoId, mongoIds });
  await db.collection("books").insertOne({ title: "Book 1", pages: 100, weight: 999 });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("MongoId null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      mongoId: null
      mongoId_in: null
      ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("[MongoId] null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
        SORT: {title: 1}, 
        mongoIds: null
        mongoIds_in: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});

test("MongoId ne null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
      SORT: {title: 1}, 
      mongoId_ne: null
      ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "XXX", pages: 100 }]
  });
});

test("[MongoId] ne null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(
        SORT: {title: 1}, 
        mongoIds_ne: null
    ){Books{title, pages}}}`,
    coll: "allBooks",
    results: [{ title: "XXX", pages: 100 }]
  });
});
