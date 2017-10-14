import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray } from "../testUtil";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter");
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });

  await db.collection("books").insert({ _id: "1", title: "Book 1", weight: 5.1 });
  await db.collection("books").insert({ _id: "2", title: "Book 2", weight: 5.5 });
  await db.collection("books").insert({ _id: "3", title: "Book 3", weight: 5.9 });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Match single", async () => {
  await queryAndMatchArray({ schema, db, query: `{getBook(_id: "1"){title}}`, coll: "getBook", results: { title: "Book 1" } });
});

test("Match single 2", async () => {
  await queryAndMatchArray({ schema, db, query: `{getBook(_id: "2"){title}}`, coll: "getBook", results: { title: "Book 2" } });
});
