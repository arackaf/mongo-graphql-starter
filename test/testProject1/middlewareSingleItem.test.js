import spinUp from "./spinUp";
import { middleware } from "mongo-graphql-starter";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  await db.collection("books").insert({ _id: "4", title: "Book 4", pages: 200 });
  await db.collection("books").insert({ _id: "6", title: "Book 6", pages: 200 });
  await db.collection("books").insert({ _id: "5", title: "Book 5", pages: 200 });
  await db.collection("books").insert({ _id: "8", title: "Book 8", pages: 200 });
  await db.collection("books").insert({ _id: "1", title: "Book 1", pages: 100 });
  await db.collection("books").insert({ _id: ObjectId("59e41fc694dc6983d41deed1"), title: "Book 2", pages: 150 });
  await db.collection("books").insert({ _id: "7", title: "Book 7", pages: 210 });
  await db.collection("books").insert({ _id: "3", title: "Book 3", pages: 90 });

  middleware.use((deconstructedQuery, root, args, context, ast) => {
    deconstructedQuery.$match._id = ObjectId("59e41fc694dc6983d41deed1");
  });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;

  middleware.clearAll();
});

test("Test middleware single item 1", async () => {
  await queryAndMatchArray({
    query: "{getBook{Book{title, pages}}}",
    coll: "getBook",
    results: { title: "Book 2", pages: 150 }
  });
});
