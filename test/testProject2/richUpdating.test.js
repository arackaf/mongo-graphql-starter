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
  await db.collection("blogs").remove({});
  db.close();
  db = null;
});

test("Basic increment", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", words: 100}){_id}`,
    result: "createBlog"
  });

  obj = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {words_INC: 1}){title, words}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", words: 101 });
});

test("Basic increment 2", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", words: 100}){_id}`,
    result: "createBlog"
  });

  obj = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {words_INC: 4}){title, words}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", words: 104 });
});

test("Basic decrement", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", words: 100}){_id}`,
    result: "createBlog"
  });

  obj = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {words_DEC: 1}){title, words}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", words: 99 });
});

test("Basic decrement 2", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", words: 100}){_id}`,
    result: "createBlog"
  });

  obj = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {words_DEC: 4}){title, words}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", words: 96 });
});
