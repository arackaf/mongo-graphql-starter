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

test("Deep querying 1", async () => {
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
      }){Blog{_id}}`,
    result: "createBlog"
  });

  await queryAndMatchArray({
    query: `{getBlog(_id: "${obj._id}"){Blog{
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
    }}}`,
    coll: "getBlog",
    results: {
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
    }
  });
});

test("Deep querying 2", async () => {
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
      }){Blog{_id}}`,
    result: "createBlog"
  });

  await queryAndMatchArray({
    query: `{getBlog(_id: "${obj._id}"){Blog{
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
    }}}`,
    coll: "getBlog",
    results: {
      title: "Blog 1",
      content: "Hello",
      author: { name: "Adam Auth", birthday: "06/02/2004", favoriteTag: { name: "tf" }, tagsSubscribed: [{ name: "t1" }, { name: "t2" }] },
      comments: [
        {
          text: "C1",
          reviewers: [
            { name: "Adam", tagsSubscribed: [{ name: "t1" }, { name: "t2" }] },
            { name: "Adam2", tagsSubscribed: [{ name: "t3" }, { name: "t4" }] }
          ],
          author: { name: "Adam", birthday: "03/22/1982", favoriteTag: { name: "tf" }, tagsSubscribed: [{ name: "t1" }, { name: "t2" }] }
        }
      ]
    }
  });
});

test("Deep querying 3", async () => {
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
      }){Blog{_id}}`,
    result: "createBlog"
  });

  await queryAndMatchArray({
    query: `{getBlog(_id: "${obj._id}"){Blog{
      title, 
      content, 
      author{
        name, 
        birthday
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
          name
        }
      }
    }}}`,
    coll: "getBlog",
    results: {
      title: "Blog 1",
      content: "Hello",
      author: { name: "Adam Auth", birthday: "06/02/2004" },
      comments: [
        {
          text: "C1",
          reviewers: [
            { name: "Adam", birthday: "03/22/1982", tagsSubscribed: [{ name: "t1" }, { name: "t2" }] },
            { name: "Adam2", birthday: "03/23/1982", tagsSubscribed: [{ name: "t3" }, { name: "t4" }] }
          ],
          author: { name: "Adam" }
        }
      ]
    }
  });
});

test("Deep querying 4", async () => {
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
      }){Blog{_id}}`,
    result: "createBlog"
  });

  await queryAndMatchArray({
    query: `{getBlog(_id: "${obj._id}"){Blog{
      title, 
      content, 
      author{
        favoriteTag{
          name
        }, 
        tagsSubscribed{
          name
        }
      }, 
      comments{
        text,
        author{
          favoriteTag{
            name
          }, 
          tagsSubscribed{
            name
          }
        }
      }
    }}}`,
    coll: "getBlog",
    results: {
      title: "Blog 1",
      content: "Hello",
      author: { favoriteTag: { name: "tf" }, tagsSubscribed: [{ name: "t1" }, { name: "t2" }] },
      comments: [
        {
          text: "C1",
          author: { favoriteTag: { name: "tf" }, tagsSubscribed: [{ name: "t1" }, { name: "t2" }] }
        }
      ]
    }
  });
});
