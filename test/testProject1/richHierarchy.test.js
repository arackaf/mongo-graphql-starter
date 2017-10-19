import { MongoClient } from "mongodb";
import resolvers from "./graphQL/resolver";
import typeDefs from "./graphQL/schema";
import { makeExecutableSchema } from "graphql-tools";

import { queryAndMatchArray, runMutation } from "../testUtil";

let db, schema;
beforeAll(async () => {
  db = await MongoClient.connect("mongodb://localhost:27017/mongo-graphql-starter");
  schema = makeExecutableSchema({ typeDefs, resolvers, initialValue: { db: {} } });
});

afterAll(async () => {
  await db.collection("blogs").remove({});
  db.close();
  db = null;
});

test("Create minimal object", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(title: "Blog 1", content: "Hello"){title, content, comments{text}}`,
    result: "createBlog"
  });
  expect(obj).toEqual({ title: "Blog 1", content: "Hello", comments: null });
});

test("Add comment", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(title: "Blog 1", content: "Hello", comments: [{text: "C1"}]){title, content, comments{text}}`,
    result: "createBlog"
  });
  expect(obj).toEqual({ title: "Blog 1", content: "Hello", comments: [{ text: "C1" }] });
});

test("Add author to comment", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(title: "Blog 1", content: "Hello", comments: [{text: "C1", author: {name: "Adam", birthday: "1982-03-22"}}]){title, content, comments{text, author{name, birthday}}}`,
    result: "createBlog"
  });
  expect(obj).toEqual({ title: "Blog 1", content: "Hello", comments: [{ text: "C1", author: { name: "Adam", birthday: "03/22/1982" } }] });
});

test("Add tags to author", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(title: "Blog 1", content: "Hello", comments: [{text: "C1", author: {name: "Adam", birthday: "1982-03-22", tagsSubscribed: [{name: "t1"}, {name: "t2"}]}}]){title, content, comments{text, author{name, birthday, tagsSubscribed{name}}}}`,
    result: "createBlog"
  });
  expect(obj).toEqual({
    title: "Blog 1",
    content: "Hello",
    comments: [{ text: "C1", author: { name: "Adam", birthday: "03/22/1982", tagsSubscribed: [{ name: "t1" }, { name: "t2" }] } }]
  });
});

test("Add reviewers with tags to author", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `
      createBlog(
        title: "Blog 1", 
        content: "Hello", 
        comments: [{
          text: "C1", 
          reviewers: [{
            name: "Adam", 
            birthday: "1982-03-22", 
            tagsSubscribed: [{name: "t1"}, {name: "t2"}]
          }, {
            name: "Adam2", 
            birthday: "1982-03-23", 
            tagsSubscribed: [{name: "t3"}, {name: "t4"}]
          }],
          author: { name: "Adam", birthday: "1982-03-22", tagsSubscribed: [{name: "t1"},  {name: "t2"}]} 
        }]
      ){title, content, comments{text, reviewers{name, birthday, tagsSubscribed{name}}, author{name, birthday, tagsSubscribed{name}}}}`,
    result: "createBlog"
  });
  expect(obj).toEqual({
    title: "Blog 1",
    content: "Hello",
    comments: [
      {
        text: "C1",
        reviewers: [
          { name: "Adam", birthday: "03/22/1982", tagsSubscribed: [{ name: "t1" }, { name: "t2" }] },
          { name: "Adam2", birthday: "03/23/1982", tagsSubscribed: [{ name: "t3" }, { name: "t4" }] }
        ],
        author: { name: "Adam", birthday: "03/22/1982", tagsSubscribed: [{ name: "t1" }, { name: "t2" }] }
      }
    ]
  });
});

test("Add favorite tag to author and reviewers reviewers with tags to author", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `
      createBlog(
        title: "Blog 1", 
        content: "Hello", 
        author: { name: "Adam Auth", birthday: "2004-06-02", favoriteTag: {name: "tf"}, tagsSubscribed: [{name: "t1"}, {name: "t2"}]},
        comments: [{
          text: "C1", 
          reviewers: [{
            name: "Adam", 
            birthday: "1982-03-22", 
            tagsSubscribed: [{name: "t1"}, {name: "t2"}]
          }, {
            name: "Adam2", 
            birthday: "1982-03-23", 
            tagsSubscribed: [{name: "t3"}, {name: "t4"}]
          }],
          author: { name: "Adam", birthday: "1982-03-22", favoriteTag: {name: "tf"}, tagsSubscribed: [{name: "t1"}, {name: "t2"}]} 
        }]
      ){title, content, author{name, birthday, favoriteTag{name}, tagsSubscribed{name}}, comments{text, reviewers{name, birthday, tagsSubscribed{name}}, author{name, birthday, favoriteTag{name}, tagsSubscribed{name}}}}`,
    result: "createBlog"
  });
  expect(obj).toEqual({
    title: "Blog 1",
    content: "Hello",
    author: { name: "Adam Auth", birthday: "06/02/2004", favoriteTag: { name: "tf" }, tagsSubscribed: [{ name: "t1" }, { name: "t2" }] },
    comments: [
      {
        text: "C1",
        reviewers: [
          { name: "Adam", birthday: "03/22/1982", tagsSubscribed: [{ name: "t1" }, { name: "t2" }] },
          { name: "Adam2", birthday: "03/23/1982", tagsSubscribed: [{ name: "t3" }, { name: "t4" }] }
        ],
        author: { name: "Adam", birthday: "03/22/1982", favoriteTag: { name: "tf" }, tagsSubscribed: [{ name: "t1" }, { name: "t2" }] }
      }
    ]
  });
});
