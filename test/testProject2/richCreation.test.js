import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());
});

afterAll(async () => {
  await db.collection("blogs").deleteMany({});
  close();
  db = null;
});

test("Create minimal object", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", content: "Hello"}){Blog{title, content, comments{text}}}`,
    result: "createBlog"
  });
  expect(obj).toEqual({ title: "Blog 1", content: "Hello", comments: null });
});

test("_id added automatically", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", content: "Hello"}){Blog{_id}}`,
    result: "createBlog"
  });

  await queryAndMatchArray({ schema, db, query: `{getBlog(_id: "${obj._id}"){Blog{title}}}`, coll: "getBlog", results: { title: "Blog 1" } });
});

test("Add comment", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", content: "Hello", comments: [{text: "C1"}]}){Blog{title, content, comments{text}}}`,
    result: "createBlog"
  });
  expect(obj).toEqual({ title: "Blog 1", content: "Hello", comments: [{ text: "C1" }] });
});

test("Add author to comment", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", content: "Hello", comments: [{text: "C1", author: {name: "Adam", birthday: "1982-03-22"}}]}){Blog{title, content, comments{text, author{name, birthday}}}}`,
    result: "createBlog"
  });
  expect(obj).toEqual({ title: "Blog 1", content: "Hello", comments: [{ text: "C1", author: { name: "Adam", birthday: "03/22/1982" } }] });
});

test("Add tags to author", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", content: "Hello", comments: [{text: "C1", author: {name: "Adam", birthday: "1982-03-22", tagsSubscribed: [{name: "t1"}, {name: "t2"}]}}]}){Blog{title, content, comments{text, author{name, birthday, tagsSubscribed{name}}}}}`,
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
    mutation: `
      createBlog(Blog: {
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
      }){Blog{title, content, comments{text, reviewers{name, birthday, tagsSubscribed{name}}, author{name, birthday, tagsSubscribed{name}}}}}`,
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
    mutation: `
      createBlog(Blog: {
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
      }){Blog{
        title, 
        content, 
        author{
          name, 
          birthday, 
          favoriteTag{
            name
          }, 
          tagsSubscribed{
            name
          }
        }, 
        comments{
          text, 
          reviewers{
            name, 
            birthday, 
            tagsSubscribed{
              name
            }
          }, 
          author{
            name, 
            birthday, 
            favoriteTag{
              name
            }, 
            tagsSubscribed{
              name
            }
          }
        }
      }}`,
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
