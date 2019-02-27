import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());
});

afterEach(async () => {
  await db.collection("books").deleteMany({});
});

afterAll(async () => {
  close();
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

test("Query value", async () => {
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
    query: `{allBooks(jsonContent: {a: 1, b: "b"}){Books{_id}}}`,
    coll: "allBooks",
    results: [{ _id: withJson._id }]
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

test("Query not value", async () => {
  const bookA = await runMutation({
    mutation: `createBook(Book: {title: "Book A", jsonContent: {a: 2, b: "b"}}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });

  const bookB = await runMutation({
    mutation: `createBook(Book: {title: "Book B", jsonContent: {a: 1, b: "b"}}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });

  const bookC = await runMutation({
    mutation: `createBook(Book: {title: "Book C"}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });

  await queryAndMatchArray({
    query: `{allBooks(jsonContent_ne: {a: 1, b: "b"}, SORT: {title: 1}){Books{_id}}}`,
    coll: "allBooks",
    results: [{ _id: bookA._id }, { _id: bookC._id }]
  });
});

test("Query in value", async () => {
  const bookA = await runMutation({
    mutation: `createBook(Book: {title: "Book A", jsonContent: {a: 2, b: "b"}}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });

  const bookB = await runMutation({
    mutation: `createBook(Book: {title: "Book B", jsonContent: {a: 1, b: "b"}}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });

  const bookC = await runMutation({
    mutation: `createBook(Book: {title: "Book C"}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });

  const bookD = await runMutation({
    mutation: `createBook(Book: {title: "Book C", jsonContent: {a: 99, b: "c"}}){Book{_id, title, jsonContent}}`,
    result: "createBook"
  });

  await queryAndMatchArray({
    query: `{allBooks(jsonContent_in: [{a: 1, b: "b"}, {a: 2, b: "b"}], SORT: {title: 1}){Books{_id}}}`,
    coll: "allBooks",
    results: [{ _id: bookA._id }, { _id: bookB._id }]
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
