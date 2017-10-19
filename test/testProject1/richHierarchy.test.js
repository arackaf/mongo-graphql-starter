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

// test("Creation mutation runs and returns object, then searched with graphQL. Check non-created fields", async () => {
//   let obj = await runMutation({ schema, db, mutation: `createBook(title: "Book 3", pages: 150){_id}`, result: "createBook" });
//   await queryAndMatchArray({
//     schema,
//     db,
//     query: `{getBook(_id: "${obj._id}"){title, pages, weight}}`,
//     coll: "getBook",
//     results: { title: "Book 3", pages: 150, weight: null }
//   });
// });

// test("Creation mutation runs and returns object with formatting", async () => {
//   let obj = await runMutation({
//     schema,
//     db,
//     mutation: `createBook(title: "Book 2", pages: 100, weight: 1.2, authors: [{birthday: "1982-03-22", name: "Adam"}, {birthday: "2004-06-02", name: "Bob"}], primaryAuthor: {birthday: "2004-06-02", name: "Bob"}, strArrs: [["a"], ["b", "c"]], createdOn: "2004-06-03", createdOnYearOnly: "2004-06-03"){title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}`,
//     result: "createBook"
//   });
//   expect(obj).toEqual({
//     title: "Book 2",
//     pages: 100,
//     weight: 1.2,
//     authors: [{ birthday: "03/22/1982", name: "Adam" }, { birthday: "06/02/2004", name: "Bob" }],
//     primaryAuthor: { birthday: "06/02/2004", name: "Bob" },
//     strArrs: [["a"], ["b", "c"]],
//     createdOn: "06/03/2004",
//     createdOnYearOnly: "2004"
//   });
// });

// test("Modification mutation works", async () => {
//   let obj = await runMutation({
//     schema,
//     db,
//     mutation: `createBook(title: "Book 2", pages: 100, weight: 1.2, authors: [{birthday: "1982-03-22", name: "Adam"}, {birthday: "2004-06-02", name: "Bob"}], primaryAuthor: {birthday: "2004-06-02", name: "Bob"}, strArrs: [["a"], ["b", "c"]], createdOn: "2004-06-03", createdOnYearOnly: "2004-06-03"){_id, title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}`,
//     result: "createBook"
//   });

//   let updated = await runMutation({
//     schema,
//     db,
//     mutation: `updateBook(_id: "${obj._id}", title: "Book 2a", pages: 101, weight: 1.3, authors: [{birthday: "1982-03-23", name: "Adam R"}, {birthday: "2004-06-03", name: "Bob B"}], primaryAuthor: {birthday: "2000-01-02", name: "Mike"}, strArrs: [["d"], ["e", "f"]], createdOn: "2004-06-04", createdOnYearOnly: "2004-06-05"){title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}`,
//     result: "updateBook"
//   });
//   expect(updated).toEqual({
//     title: "Book 2a",
//     pages: 101,
//     weight: 1.3,
//     authors: [{ birthday: "03/23/1982", name: "Adam R" }, { birthday: "06/03/2004", name: "Bob B" }],
//     primaryAuthor: { birthday: "01/02/2000", name: "Mike" },
//     strArrs: [["d"], ["e", "f"]],
//     createdOn: "06/04/2004",
//     createdOnYearOnly: "2004"
//   });
// });

// test("Modification mutation works", async () => {
//   let obj = await runMutation({
//     schema,
//     db,
//     mutation: `createBook(authors: [{birthday: "1982-03-22", name: "Adam"}], primaryAuthor: {birthday: "2004-06-02", name: "Bob"}){_id, title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}`,
//     result: "createBook"
//   });

//   let updated = await runMutation({
//     schema,
//     db,
//     mutation: `updateBook(_id: "${obj._id}", authors: [{birthday: "1982-03-23", name: "Adam R"}, {birthday: "2004-06-03", name: "Bob B"}], primaryAuthor: {birthday: "2000-01-02", name: "Mike"}){title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}`,
//     result: "updateBook"
//   });
//   expect(updated).toEqual({
//     title: null,
//     pages: null,
//     weight: null,
//     authors: [{ birthday: "03/23/1982", name: "Adam R" }, { birthday: "06/03/2004", name: "Bob B" }],
//     primaryAuthor: { birthday: "01/02/2000", name: "Mike" },
//     strArrs: null,
//     createdOn: null,
//     createdOnYearOnly: null
//   });
// });

// test("Partial modification mutation works", async () => {
//   let obj = await runMutation({
//     schema,
//     db,
//     mutation: `createBook(title: "Book 2", pages: 100, weight: 1.2, authors: [{birthday: "1982-03-22", name: "Adam"}, {birthday: "2004-06-02", name: "Bob"}], primaryAuthor: {birthday: "2004-06-02", name: "Bob"}, strArrs: [["a"], ["b", "c"]], createdOn: "2004-06-03", createdOnYearOnly: "2004-06-03"){_id, title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}`,
//     result: "createBook"
//   });

//   let updated = await runMutation({
//     schema,
//     db,
//     mutation: `updateBook(_id: "${obj._id}", title: "Book 2a", pages: 101){title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}`,
//     result: "updateBook"
//   });
//   expect(updated).toEqual({
//     title: "Book 2a",
//     pages: 101,
//     weight: 1.2,
//     authors: [{ birthday: "03/22/1982", name: "Adam" }, { birthday: "06/02/2004", name: "Bob" }],
//     primaryAuthor: { birthday: "06/02/2004", name: "Bob" },
//     strArrs: [["a"], ["b", "c"]],
//     createdOn: "06/03/2004",
//     createdOnYearOnly: "2004"
//   });
// });

// test("No modification mutation works", async () => {
//   let obj = await runMutation({
//     schema,
//     db,
//     mutation: `createBook(title: "Book 2", pages: 100, weight: 1.2, authors: [{birthday: "1982-03-22", name: "Adam"}, {birthday: "2004-06-02", name: "Bob"}], primaryAuthor: {birthday: "2004-06-02", name: "Bob"}, strArrs: [["a"], ["b", "c"]], createdOn: "2004-06-03", createdOnYearOnly: "2004-06-03"){_id, title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}`,
//     result: "createBook"
//   });

//   let updated = await runMutation({
//     schema,
//     db,
//     mutation: `updateBook(_id: "${obj._id}"){title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}`,
//     result: "updateBook"
//   });
//   expect(updated).toEqual({
//     title: "Book 2",
//     pages: 100,
//     weight: 1.2,
//     authors: [{ birthday: "03/22/1982", name: "Adam" }, { birthday: "06/02/2004", name: "Bob" }],
//     primaryAuthor: { birthday: "06/02/2004", name: "Bob" },
//     strArrs: [["a"], ["b", "c"]],
//     createdOn: "06/03/2004",
//     createdOnYearOnly: "2004"
//   });
// });
