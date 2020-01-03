import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({
    _id: ObjectId("59e3dbdf94dc6983d41deece"),
    title: "Book 1",
    weight: 5.1,
    pages: 600,
    isRead: true,
    createdOn: new Date("2004-06-02T01:30:45"),
    createdOnYearOnly: new Date("2004-06-02T01:30:45")
  });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Query without fragment: to give a baseline.", async () => {
  await queryAndMatchArray({
    query: `{getBook(_id: "59e3dbdf94dc6983d41deece"){Book{title weight}}}`,
    coll: "getBook",
    results: { title: "Book 1", weight: 5.1 }
  });
});

test("Query with fragment: Happy Path - One level of Fragments.", async () => {
  await queryAndMatchArray({
    query: `fragment d1 on Book {title} query{getBook(_id: "59e3dbdf94dc6983d41deece"){Book{...d1 weight}}}`,
    coll: "getBook",
    results: { title: "Book 1", weight: 5.1 }
  });
});

test("Query with 2 level deep fragments.", async () => {
  await queryAndMatchArray({
    query: `
    fragment d1 on Book {
      title
    }
    fragment d2 on Book {
      ...d1
      pages
    }
    query {
      getBook(_id: "59e3dbdf94dc6983d41deece") {
        Book {
          ...d2
          weight
        }
      }
    }`,
    coll: "getBook",
    results: {
      title: "Book 1",
      pages: 600,
      weight: 5.1
    }
  });
});

test("Query with 3 level deep fragments.", async () => {
  await queryAndMatchArray({
    query: `
    fragment d1 on Book {
      title
    }
    fragment d2 on Book {
      ...d1
      pages
    }

    fragment d3 on Book {
      ...d2
      isRead
    }
    query {
      getBook(_id: "59e3dbdf94dc6983d41deece") {
        Book {
          ...d3
          weight
        }
      }
    }`,
    coll: "getBook",
    results: {
      title: "Book 1",
      pages: 600,
      isRead: true,
      weight: 5.1
    }
  });
});
