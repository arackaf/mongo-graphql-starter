import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());
});

afterEach(async () => {
  await db.collection("books").remove({});
});

afterAll(async () => {
  db.close();
  db = null;
});

test("Creation mutation works with JSON", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", jsonContent: {a: 1, b: "b"}}){Book{title, jsonContent}}`,
    result: "createBook"
  });

  expect(obj).toEqual({ title: "Book 1", jsonContent: { a: 1, b: "b" } });
});

test("Query null", async () => {
  const withJson = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", jsonContent: {a: 1, b: "b"}}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });
  expect(withJson.jsonContent).toBeDefined();
  const withoutJson = await runMutation({
    mutation: `createBook(Book: {title: "Book 1"}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });
  expect(withoutJson.jsonContent).toBe(null);
  

  await queryAndMatchArray({
    query: `{allBooks(jsonContent: null){Books{_id}}}`,
    coll: "allBooks",
    results: [{ _id: withoutJson._id }]
  });
});

test("Query not null", async () => {
  const withJson = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", jsonContent: {a: 1, b: "b"}}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });
  expect(withJson.jsonContent).toBeDefined();
  const withoutJson = await runMutation({
    mutation: `createBook(Book: {title: "Book 1"}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });
  expect(withoutJson.jsonContent).toBe(null);
  

  await queryAndMatchArray({
    query: `{allBooks(jsonContent_ne: null){Books{_id}}}`,
    coll: "allBooks",
    results: [{ _id: withJson._id }]
  });
});

test("Update JSON", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", jsonContent: {a: 1, b: "b"}}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });

  let updated = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: {jsonContent: {x: 0}}){Book{jsonContent}}`,
    result: "updateBook"
  });

  expect(updated).toEqual({ jsonContent: { x: 0 } });

  await queryAndMatchArray({
    query: `{getBook(_id: "${obj._id}"){Book{jsonContent}}}`,
    coll: "getBook",
    results: { jsonContent: { x: 0 } }
  });
});

test("Update JSON multi", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", jsonContent: {a: 1, b: "b"}}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });

  let updated = await runMutation({
    mutation: `updateBooks(_ids: ["${obj._id}"], Updates: {jsonContent: {x: 0}}){Books{jsonContent}}`,
    result: "updateBooks"
  });

  expect(updated).toEqual([{ jsonContent: { x: 0 } }]);

  await queryAndMatchArray({
    query: `{getBook(_id: "${obj._id}"){Book{jsonContent}}}`,
    coll: "getBook",
    results: { jsonContent: { x: 0 } }
  });
});

test("Update JSON bulk", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", jsonContent: {a: 1, b: "b"}}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });

  await runMutation({
    mutation: `updateBooksBulk(Match: { _id: "${obj._id}" }, Updates: {jsonContent: {x: 0}}){success}`,
    result: "updateBooksBulk"
  });

  await queryAndMatchArray({
    query: `{getBook(_id: "${obj._id}"){Book{jsonContent}}}`,
    coll: "getBook",
    results: { jsonContent: { x: 0 } }
  });
});
