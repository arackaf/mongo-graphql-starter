import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Creation mutation runs", async () => {
  await runMutation({ mutation: `createBook(Book: {title: "Book 1", pages: 100}){Book{title, pages}}`, result: "createBook" });
});
