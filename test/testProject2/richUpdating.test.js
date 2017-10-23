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

test("Push new comment", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1"}]}){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {title: "Blog 1", comments_PUSH: {text: "C2"}}){title, comments{text}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ title: "Blog 1", comments: [{ text: "C1" }, { text: "C2" }] });
});

test("Concat new comments", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1"}]}){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {title: "Blog 1", comments_CONCAT: [{text: "C2"}, {text: "C3"}]}){title, comments{text}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ title: "Blog 1", comments: [{ text: "C1" }, { text: "C2" }, { text: "C3" }] });
});

test("Add mutate author - add favorite tag and birthday", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", author: { name: "Adam Auth"} }){ _id }`,
    result: "createBlog"
  });

  obj = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: { author_UPDATE: { birthday: "2004-06-03", favoriteTag: {name: "tf"}}}){title, author{name, birthday, favoriteTag{name}}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", author: { name: "Adam Auth", birthday: "06/03/2004", favoriteTag: { name: "tf" } } });
});

test("Add mutate author - add favorite tag and birthday", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", author: { name: "Adam Auth", birthday: "2004-06-02"} }){ _id }`,
    result: "createBlog"
  });

  obj = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: { author_UPDATE: { favoriteTag: {name: "ft"}}}){title, author{name, birthday, favoriteTag{name}}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", author: { name: "Adam Auth", birthday: "06/02/2004", favoriteTag: { name: "ft" } } });
});

test("Nested mutation", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", author: { name: "Adam Auth", favoriteTag: { name: "ft" }} }){ _id }`,
    result: "createBlog"
  });

  obj = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: { author_UPDATE: { favoriteTag_UPDATE: {description: "desc"}}}){title, author{name, favoriteTag{name, description}}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", author: { name: "Adam Auth", favoriteTag: { name: "ft", description: "desc" } } });
});
