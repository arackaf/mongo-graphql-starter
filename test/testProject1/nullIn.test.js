import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let mongoId1 = ObjectId("5c266fd9967e9b904df20e7f");
let mongoId2 = ObjectId("5770975f3a68fc53527c262f");
let mongoIds = [mongoId1];

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "XXX", pages: 100, weight: 999, mongoId: mongoId1, mongoIds: [null, mongoId1], keywords: [null] });
  await db.collection("books").insertOne({ title: "Book 1", pages: 101, weight: 999, mongoId: mongoId2, mongoIds: [mongoId2], keywords: ["B"] });
  await db.collection("books").insertOne({ title: null, pages: 99, weight: 999, mongoId: null, mongoIds: [null], keywords: ["C", null] });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("MongoId in with null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoId_in: [null], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 99 }]
  });
});

test("MongoId in with null works 2", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoId_in: [null, "${mongoId2}"], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 99 }, { pages: 101 }]
  });
});

test("MongoId not in with null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoId_nin: [null], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 100 }, { pages: 101 }]
  });
});

test("MongoId not in with null works 2", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoId_nin: [null, "${mongoId2}"], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 100 }]
  });
});

// -----

test("MongoIds in with null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoIds_in: [[null]], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 99 }]
  });
});

test("MongoIds in with null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoIds_in: [[null], [null, "${mongoId1}"]], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 99 }, { pages: 100 }]
  });
});

test("MongoIds not in with null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoIds_nin: [[null]], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 100 }, { pages: 101 }]
  });
});

test("MongoIds not in with null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(mongoIds_nin: [[null], [null, "${mongoId1}"]], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 101 }]
  });
});

// --------------------------------------------------------------------------------------------

test("Title in with null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_in: [null], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 99 }]
  });
});

test("Title in with null works 2", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_in: [null, "XXX"], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 99 }, { pages: 100 }]
  });
});

test("Title not in with null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_nin: [null], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 100 }, { pages: 101 }]
  });
});

test("Title not in with null works 2", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_nin: [null, "XXX"], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 101 }]
  });
});

// --------------------------------------------------------------------------------------------

test("Keywords in with null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(keywords_in: [[null]], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 100 }]
  });
});

test("Keywords in with null works 2", async () => {
  await queryAndMatchArray({
    query: `{allBooks(keywords_in: [[null], ["C", null]], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 99 }, { pages: 100 }]
  });
});

test("Keywords not in with null works", async () => {
  await queryAndMatchArray({
    query: `{allBooks(keywords_nin: [[null]], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 99 }, { pages: 101 }]
  });
});

test("Keywords not in with null works 2", async () => {
  await queryAndMatchArray({
    query: `{allBooks(keywords_nin: [["C", null]], SORT: {pages: 1}){Books{pages}}}`,
    coll: "allBooks",
    results: [{ pages: 100 }, { pages: 101 }]
  });
});
