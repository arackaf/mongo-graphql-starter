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

test("Update comment", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1"}]}){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {comments_UPDATE: {index: 0, Comment: { upVotes: 2 } } }){title, comments{text, upVotes}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ title: "Blog 1", comments: [{ text: "C1", upVotes: 2 }] });
});

test("Update comment 2", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", upVotes: 2}]}){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {comments_UPDATE: {index: 0, Comment: { upVotes_INC: 1 } } }){title, comments{text, upVotes}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ title: "Blog 1", comments: [{ text: "C1", upVotes: 3 }] });
});

test("Update comment 3", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", upVotes: 2}]}){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {comments_UPDATE: {index: 0, Comment: { upVotes_DEC: 1 } } }){title, comments{text, upVotes}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ title: "Blog 1", comments: [{ text: "C1", upVotes: 1 }] });
});

test("Update comment's author", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", author: {name: "Adam"}}]}){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {comments_UPDATE: {index: 0, Comment: { author_UPDATE: { birthday: "1982-03-22" } } } }){title, comments{text, author{name, birthday}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ title: "Blog 1", comments: [{ text: "C1", author: { name: "Adam", birthday: "03/22/1982" } }] });
});

test("Update comment's author - add favorite tag", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", author: {name: "Adam"}}]}){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {comments_UPDATE: {index: 0, Comment: { author_UPDATE: { birthday: "1982-03-22", favoriteTag: {name: "ft"} } } } }){title, comments{text, author{name, birthday, favoriteTag{name}}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [{ text: "C1", author: { name: "Adam", birthday: "03/22/1982", favoriteTag: { name: "ft" } } }]
  });
});

test("Update comment's author's favorite tag", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", author: {name: "Adam", favoriteTag: {name: "ft"}}}]}){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {comments_UPDATE: {index: 0, Comment: { author_UPDATE: { birthday: "1982-03-22", favoriteTag_UPDATE: {description: "desc"} } } } }){title, comments{text, author{name, birthday, favoriteTag{name, description}}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [{ text: "C1", author: { name: "Adam", birthday: "03/22/1982", favoriteTag: { name: "ft", description: "desc" } } }]
  });
});

test("Update comment's author's favorite tag 2", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", author: {name: "Adam", favoriteTag: {name: "ft", timesUsed: 2}}}]}){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {comments_UPDATE: {index: 0, Comment: { author_UPDATE: { birthday: "1982-03-22", favoriteTag_UPDATE: {timesUsed_INC: 2} } } } }){title, comments{text, author{name, birthday, favoriteTag{name, timesUsed}}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [{ text: "C1", author: { name: "Adam", birthday: "03/22/1982", favoriteTag: { name: "ft", timesUsed: 4 } } }]
  });
});

test("Update deep author info 1", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", author: {name: "Adam", favoriteTag: {name: "ft"}, tagsSubscribed: [{name: "t1"}]}}]}){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {comments_UPDATE: {index: 0, Comment: { author_UPDATE: { birthday: "1982-03-22", favoriteTag_UPDATE: {description: "desc"}, tagsSubscribed_UPDATE: {index: 0, Tag: {name: "t1-update"} } } } } }){title, comments{text, author{name, birthday, tagsSubscribed{name}, favoriteTag{name, description}}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [
      {
        text: "C1",
        author: {
          name: "Adam",
          birthday: "03/22/1982",
          tagsSubscribed: [{ name: "t1-update" }],
          favoriteTag: { name: "ft", description: "desc" }
        }
      }
    ]
  });
});

test("Update deep author info 2", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", author: {name: "Adam", favoriteTag: {name: "ft"}, tagsSubscribed: [{name: "t1"}]}}]}){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {comments_UPDATE: {index: 0, Comment: { author_UPDATE: { birthday: "1982-03-22", favoriteTag_UPDATE: {description: "desc"}, tagsSubscribed_PUSH: {name: "t2"} } } } }){title, comments{text, author{name, birthday, tagsSubscribed{name}, favoriteTag{name, description}}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [
      {
        text: "C1",
        author: {
          name: "Adam",
          birthday: "03/22/1982",
          tagsSubscribed: [{ name: "t1" }, { name: "t2" }],
          favoriteTag: { name: "ft", description: "desc" }
        }
      }
    ]
  });
});

test("Update deep author info 3", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: 
      {
        title: "Blog 1", 
        comments: [
          {
            text: "C1", author: {
              name: "Adam", 
              favoriteTag: {name: "ft"}, 
              tagsSubscribed: [{name: "t1"}, {name: "t2"}]
            }
          }
        ]
      }){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {
      comments_UPDATE: {
        index: 0, 
        Comment: { 
          author_UPDATE: { 
            birthday: "1982-03-22", 
            favoriteTag_UPDATE: {description: "desc"}, 
            tagsSubscribed_UPDATES: [
              {index: 0, Tag: {name: "t1-update"} }, 
              {index: 1, Tag: {name: "t2-update"} }
            ] 
          } 
        } 
      } 
    }){title, comments{
      text, 
      author{
        name, 
        birthday, 
        tagsSubscribed{name}, 
        favoriteTag{name, description}
      }
    }}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [
      {
        text: "C1",
        author: {
          name: "Adam",
          birthday: "03/22/1982",
          tagsSubscribed: [{ name: "t1-update" }, { name: "t2-update" }],
          favoriteTag: { name: "ft", description: "desc" }
        }
      }
    ]
  });
});

test("Update deep author info 4", async () => {
  let obj = await runMutation({
    schema,
    db,
    mutation: `createBlog(Blog: {
      title: "Blog 1", 
      comments: [{
        text: "C1", 
        author: {
          name: "Adam", 
          favoriteTag: {name: "ft"}, 
          tagsSubscribed: []
        }
      }]
    }){_id}`,
    result: "createBlog"
  });

  let result = await runMutation({
    schema,
    db,
    mutation: `updateBlog(_id: "${obj._id}", Blog: {
      comments_UPDATE: {
        index: 0, 
        Comment: { 
          author_UPDATE: { 
            birthday: "1982-03-22", 
            favoriteTag_UPDATE: {description: "desc"}, 
            tagsSubscribed_CONCAT: [{name: "t1"}, {name: "t2"}] 
          } 
        } 
      } 
    }){title, comments{text, author{name, birthday, tagsSubscribed{name}, favoriteTag{name, description}}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [
      {
        text: "C1",
        author: {
          name: "Adam",
          birthday: "03/22/1982",
          tagsSubscribed: [{ name: "t1" }, { name: "t2" }],
          favoriteTag: { name: "ft", description: "desc" }
        }
      }
    ]
  });
});

/*
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
*/

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
