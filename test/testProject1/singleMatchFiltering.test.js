import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({
    _id: ObjectId("59e3dbdf94dc6983d41deece"),
    title: "Book 1",
    weight: 5.1,
    createdOn: new Date("2004-06-02T01:30:45"),
    createdOnYearOnly: new Date("2004-06-02T01:30:45")
  });
  await db.collection("books").insertOne({ _id: ObjectId("59e41fc694dc6983d41deed1"), title: "Book 2", weight: 5.5 });
  await db.collection("books").insertOne({ _id: ObjectId("59e41fda94dc6983d41deed2"), title: "Book 3", weight: 5.9 });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Match single", async () => {
  await queryAndMatchArray({ query: `{getBook(_id: "59e3dbdf94dc6983d41deece"){Book{title}}}`, coll: "getBook", results: { title: "Book 1" } });
});

test("Match single - not found", async () => {
  await queryAndMatchArray({ query: `{getBook(_id: "XXX"){Book{title}}}`, coll: "getBook", results: null });
});

test("Match single 2", async () => {
  await queryAndMatchArray({ query: `{getBook(_id: "59e41fc694dc6983d41deed1"){Book{title}}}`, coll: "getBook", results: { title: "Book 2" } });
});

test("Match single", async () => {
  await queryAndMatchArray({
    query: `{allBooks(_id: "59e3dbdf94dc6983d41deece"){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1" }]
  });
});

test("Match single with date", async () => {
  await queryAndMatchArray({
    query: `{getBook(_id: "59e3dbdf94dc6983d41deece"){Book{createdOn}}}`,
    coll: "getBook",
    results: { createdOn: "06/02/2004" }
  });
});

test("Match single with date and manual format", async () => {
  await queryAndMatchArray({
    query: `{getBook(_id: "59e3dbdf94dc6983d41deece", createdOn_format: "%m"){Book{createdOn}}}`,
    coll: "getBook",
    results: { createdOn: "06" }
  });
});

test("Match single with year-only date", async () => {
  await queryAndMatchArray({
    query: `{getBook(_id: "59e3dbdf94dc6983d41deece"){Book{createdOnYearOnly}}}`,
    coll: "getBook",
    results: { createdOnYearOnly: "2004" }
  });
});

test("Match single with year-only date and manual format", async () => {
  await queryAndMatchArray({
    query: `{getBook(_id: "59e3dbdf94dc6983d41deece", createdOnYearOnly_format: "%m"){Book{createdOnYearOnly}}}`,
    coll: "getBook",
    results: { createdOnYearOnly: "06" }
  });
});
