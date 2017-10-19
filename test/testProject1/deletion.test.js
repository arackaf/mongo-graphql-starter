import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray, runMutation } from "../testUtil";

import conn from "./connection";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect(conn);
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Deletion works works", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBook(title: "Book 2"){_id, title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}`,
    result: "createBook"
  });

  await runMutation({
    schema,
    db,
    mutation: `deleteBook(_id: "${obj._id}")`,
    result: "deleteBook"
  });
  await queryAndMatchArray({ schema, db, query: "{allBooks{title}}", coll: "allBooks", results: [] });
});
