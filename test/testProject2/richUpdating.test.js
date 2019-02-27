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

test("Basic increment", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", words: 100}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {words_INC: 1}){Blog{title, words}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", words: 101 });
});

test("Basic float increment", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", rating: 3.5}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {rating_INC: 1}){Blog{title, rating}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", rating: 4.5 });
});

test("Basic increment 2", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", words: 100}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {words_INC: 4}){Blog{title, words}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", words: 104 });
});

test("Basic float increment 2", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", rating: 3.5}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {rating_INC: 2}){Blog{title, rating}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", rating: 5.5 });
});

test("Basic decrement", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", words: 100}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {words_DEC: 1}){Blog{title, words}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", words: 99 });
});

test("Basic float increment", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", rating: 3.5}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {rating_DEC: 1}){Blog{title, rating}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", rating: 2.5 });
});

//-----------------------------------------------------------------------------------------

test("float array update", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: {weights: [1.1, 2.9]}}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {author_UPDATE: {weights_UPDATE: {index: 1, value: 2.2} }}) {Blog{title, author{weights}}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", author: { weights: [1.1, 2.2] } });
});

test("float array updates", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: {weights: [1.1, 2.9]}}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {author_UPDATE: {weights_UPDATES: [{index: 0, value: 1.0}, {index: 1, value: 2.2}] }}) {Blog{title, author{weights}}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", author: { weights: [1.0, 2.2] } });
});

//-----------------------------------------------------------------------------------------

test("int array update", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: {luckyNumbers: [6, 10]}}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {author_UPDATE: {luckyNumbers_UPDATE: {index: 1, value: 11} }}) {Blog{title, author{luckyNumbers}}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", author: { luckyNumbers: [6, 11] } });
});

test("int array updates", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: {luckyNumbers: [6, 10]}}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {author_UPDATE: {luckyNumbers_UPDATES: [{index: 0, value: 7}, {index: 1, value: 11}] }}) {Blog{title, author{luckyNumbers}}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", author: { luckyNumbers: [7, 11] } });
});

//-----------------------------------------------------------------------------------------

test("string array update", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: {knicknames: ["c", "d"]}}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {author_UPDATE: {knicknames_UPDATE: {index: 1, value: "b"} }}) {Blog{title, author{knicknames}}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", author: { knicknames: ["c", "b"] } });
});

test("string array updates", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: {knicknames: ["c", "d"]}}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {author_UPDATE: {knicknames_UPDATES: [{index: 0, value: "a"}, {index: 1, value: "b"}] }}) {Blog{title, author{knicknames}}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", author: { knicknames: ["a", "b"] } });
});

//-----------------------------------------------------------------------------------------

test("Basic decrement 2", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", words: 100}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {words_DEC: 4}){Blog{title, words}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", words: 96 });
});

test("Basic float decrement 2", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", rating: 3.5}){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {rating_DEC: 2}){Blog{title, rating}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", rating: 1.5 });
});

test("Push new comment", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1"}]}){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {title: "Blog 1", comments_PUSH: {text: "C2"}}){Blog{title, comments{text}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ title: "Blog 1", comments: [{ text: "C1" }, { text: "C2" }] });
});

test("Concat new comments", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1"}]}){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {title: "Blog 1", comments_CONCAT: [{text: "C2"}, {text: "C3"}]}){Blog{title, comments{text}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ title: "Blog 1", comments: [{ text: "C1" }, { text: "C2" }, { text: "C3" }] });
});

test("Push and concat new comments", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1"}]}){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {title: "Blog 1", comments_PUSH: {text: "C2"}, comments_CONCAT: [{text: "C3"}, {text: "C4"}]}){Blog{title, comments{text}}}`,
    result: "updateBlog"
  });
  expect(result.comments.map(c => c.text).sort()).toEqual(["C1", "C2", "C3", "C4"]);
});

test("Update comment", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1"}]}){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {comments_UPDATE: {index: 0, Updates: { upVotes: 2 } } }){Blog{title, comments{text, upVotes}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ title: "Blog 1", comments: [{ text: "C1", upVotes: 2 }] });
});

test("Update comment 2", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", upVotes: 2}]}){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {comments_UPDATE: {index: 0, Updates: { upVotes_INC: 1 } } }){Blog{title, comments{text, upVotes}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ title: "Blog 1", comments: [{ text: "C1", upVotes: 3 }] });
});

test("Update comment 3", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", upVotes: 2}]}){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {comments_UPDATE: {index: 0, Updates: { upVotes_DEC: 1 } } }){Blog{title, comments{text, upVotes}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ title: "Blog 1", comments: [{ text: "C1", upVotes: 1 }] });
});

test("Update comment's author", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", author: {name: "Adam"}}]}){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {comments_UPDATE: {index: 0, Updates: { author_UPDATE: { birthday: "1982-03-22" } } } }){Blog{title, comments{text, author{name, birthday}}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ title: "Blog 1", comments: [{ text: "C1", author: { name: "Adam", birthday: "03/22/1982" } }] });
});

test("Update comment's author - add favorite tag", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", author: {name: "Adam"}}]}){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {comments_UPDATE: {index: 0, Updates: { author_UPDATE: { birthday: "1982-03-22", favoriteTag: {name: "ft"} } } } }){Blog{title, comments{text, author{name, birthday, favoriteTag{name}}}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [{ text: "C1", author: { name: "Adam", birthday: "03/22/1982", favoriteTag: { name: "ft" } } }]
  });
});

test("Update comment's author's favorite tag", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", author: {name: "Adam", favoriteTag: {name: "ft"}}}]}){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {comments_UPDATE: {index: 0, Updates: { author_UPDATE: { birthday: "1982-03-22", favoriteTag_UPDATE: {description: "desc"} } } } }){Blog{title, comments{text, author{name, birthday, favoriteTag{name, description}}}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [{ text: "C1", author: { name: "Adam", birthday: "03/22/1982", favoriteTag: { name: "ft", description: "desc" } } }]
  });
});

test("Update comment's author's favorite tag 2", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", author: {name: "Adam", favoriteTag: {name: "ft", timesUsed: 2}}}]}){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {comments_UPDATE: {index: 0, Updates: { author_UPDATE: { birthday: "1982-03-22", favoriteTag_UPDATE: {timesUsed_INC: 2} } } } }){Blog{title, comments{text, author{name, birthday, favoriteTag{name, timesUsed}}}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [{ text: "C1", author: { name: "Adam", birthday: "03/22/1982", favoriteTag: { name: "ft", timesUsed: 4 } } }]
  });
});

test("Update deep author info 1", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", author: {name: "Adam", favoriteTag: {name: "ft"}, tagsSubscribed: [{name: "t1"}]}}]}){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {comments_UPDATE: {index: 0, Updates: { author_UPDATE: { birthday: "1982-03-22", favoriteTag_UPDATE: {description: "desc"}, tagsSubscribed_UPDATE: {index: 0, Updates: {name: "t1-update"} } } } } }){Blog{title, comments{text, author{name, birthday, tagsSubscribed{name}, favoriteTag{name, description}}}}}`,
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
    mutation: `createBlog(Blog: {title: "Blog 1", comments: [{text: "C1", author: {name: "Adam", favoriteTag: {name: "ft"}, tagsSubscribed: [{name: "t1"}]}}]}){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: {comments_UPDATE: {index: 0, Updates: { author_UPDATE: { birthday: "1982-03-22", favoriteTag_UPDATE: {description: "desc"}, tagsSubscribed_PUSH: {name: "t2"} } } } }){Blog{title, comments{text, author{name, birthday, tagsSubscribed{name}, favoriteTag{name, description}}}}}`,
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
      }){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {
      comments_UPDATE: {
        index: 0, 
        Updates: { 
          author_UPDATE: { 
            birthday: "1982-03-22", 
            favoriteTag_UPDATE: {description: "desc"}, 
            tagsSubscribed_UPDATES: [
              {index: 0, Updates: {name: "t1-update"} }, 
              {index: 1, Updates: {name: "t2-update"} }
            ] 
          } 
        } 
      } 
    }){Blog{title, comments{
      text, 
      author{
        name, 
        birthday, 
        tagsSubscribed{name}, 
        favoriteTag{name, description}
      }
    }}}`,
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
    mutation: `createBlog(Blog: {
      title: "Blog 1", 
      comments: [{
        text: "C1", 
        author: {
          name: "Adam", 
          favoriteTag: {name: "ft"}, 
          tagsSubscribed: [{name: "t0"}]
        }
      }]
    }){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {
      comments_UPDATE: {
        index: 0, 
        Updates: { 
          author_UPDATE: { 
            birthday: "1982-03-22", 
            favoriteTag_UPDATE: {description: "desc"}, 
            tagsSubscribed_CONCAT: [{name: "t1"}, {name: "t2"}] 
          } 
        } 
      } 
    }){Blog{title, comments{text, author{name, birthday, tagsSubscribed{name}, favoriteTag{name, description}}}}}`,
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
          tagsSubscribed: [{ name: "t0" }, { name: "t1" }, { name: "t2" }],
          favoriteTag: { name: "ft", description: "desc" }
        }
      }
    ]
  });
});

test("Deep pull", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {
      title: "Blog 1", 
      comments: [{
        text: "C1", 
        author: {
          name: "Adam", 
          favoriteTag: {name: "ft"}, 
          tagsSubscribed: []
        }
      }, {
        text: "C2", 
        author: {
          name: "Bob", 
          favoriteTag: {name: "ft"}, 
          tagsSubscribed: []
        }
      }, {
        text: "C3", 
        author: {
          name: "Alan", 
          favoriteTag: {name: "ft"}, 
          tagsSubscribed: []
        }
      }]
    }){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {
      comments_PULL: {
        author: { 
          name_startsWith: "A" 
        } 
      } 
    }){Blog{title, comments{text}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [
      {
        text: "C2"
      }
    ]
  });
});

test("Deep pull 2", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {
      title: "Blog 1", 
      comments: [{
        text: "C1", 
        author: {
          name: "Adam", 
          favoriteTag: {name: "a"}, 
          tagsSubscribed: []
        }
      }, {
        text: "C2", 
        author: {
          name: "Bob", 
          favoriteTag: {name: "b"}, 
          tagsSubscribed: []
        }
      }, {
        text: "C3", 
        author: {
          name: "Alan", 
          favoriteTag: {name: "aaa"}, 
          tagsSubscribed: []
        }
      }]
    }){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {
      comments_PULL: {
        author: { 
          favoriteTag: { name_startsWith: "a"}
        } 
      } 
    }){Blog{title, comments{text}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [
      {
        text: "C2"
      }
    ]
  });
});

test("Deep pull 3", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {
      title: "Blog 1", 
      comments: [{
        text: "C1", 
        author: {
          name: "Adam",  
          tagsSubscribed: [{name: "a"}, {name: "aa"}]
        }
      }, {
        text: "C2", 
        author: {
          name: "Bob", 
          tagsSubscribed: [{name: "b"}]
        }
      }, {
        text: "C3", 
        author: {
          name: "Alan", 
          favoriteTag: {name: "aaa"}, 
          tagsSubscribed: [{name: "aaaa"}]
        }
      }]
    }){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: {
      comments_PULL: {
        author: { 
          tagsSubscribed: { name_startsWith: "a"}
        } 
      } 
    }){Blog{title, comments{text}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({
    title: "Blog 1",
    comments: [
      {
        text: "C2"
      }
    ]
  });
});

test("Add mutate author - add favorite tag and birthday", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: { name: "Adam Auth"} }){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: { author_UPDATE: { birthday: "2004-06-03", favoriteTag: {name: "tf"}}}){Blog{title, author{name, birthday, favoriteTag{name}}}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", author: { name: "Adam Auth", birthday: "06/03/2004", favoriteTag: { name: "tf" } } });
});

test("Add mutate author - add favorite tag and birthday", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: { name: "Adam Auth", birthday: "2004-06-02"} }){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: { author_UPDATE: { favoriteTag: {name: "ft"}}}){Blog{title, author{name, birthday, favoriteTag{name}}}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", author: { name: "Adam Auth", birthday: "06/02/2004", favoriteTag: { name: "ft" } } });
});

test("Nested mutation", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: { name: "Adam Auth", favoriteTag: { name: "ft" }} }){Blog{_id}}`,
    result: "createBlog"
  });

  obj = await runMutation({
    mutation: `updateBlog(_id: "${
      obj._id
    }", Updates: { author_UPDATE: { favoriteTag_UPDATE: {description: "desc"}}}){Blog{title, author{name, favoriteTag{name, description}}}}`,
    result: "updateBlog"
  });

  expect(obj).toEqual({ title: "Blog 1", author: { name: "Adam Auth", favoriteTag: { name: "ft", description: "desc" } } });
});

test("PUSH to author's luckynumbers", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: {name: "Adam", luckyNumbers: [0, 1]} }){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: { author_UPDATE: { luckyNumbers_PUSH: 2 } }){Blog{ author{name, luckyNumbers}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ author: { name: "Adam", luckyNumbers: [0, 1, 2] } });
});

test("CONCAT to author's luckynumbers", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: {name: "Adam", luckyNumbers: [0, 1]} }){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: { author_UPDATE: { luckyNumbers_CONCAT: [2, 3] } }){Blog{ author{name, luckyNumbers}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ author: { name: "Adam", luckyNumbers: [0, 1, 2, 3] } });
});

test("PUSH to author's knicknames", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: {name: "Adam", knicknames: ["a", "b"]} }){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: { author_UPDATE: { knicknames_PUSH: "c" } }){Blog{ author{name, knicknames}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ author: { name: "Adam", knicknames: ["a", "b", "c"] } });
});

test("CONCAT to author's knicknames", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: {name: "Adam", knicknames: ["a", "b"]} }){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: { author_UPDATE: { knicknames_CONCAT: ["c", "d"] } }){Blog{ author{name, knicknames}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ author: { name: "Adam", knicknames: ["a", "b", "c", "d"] } });
});

test("PUSH to author's weights", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: {name: "Adam", weights: [0.1, 1.9]} }){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: { author_UPDATE: { weights_PUSH: 2.3 } }){Blog{ author{name, weights}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ author: { name: "Adam", weights: [0.1, 1.9, 2.3] } });
});

test("CONCAT to author's weights", async () => {
  let obj = await runMutation({
    mutation: `createBlog(Blog: {title: "Blog 1", author: {name: "Adam", weights: [0.1, 1.9]} }){Blog{_id}}`,
    result: "createBlog"
  });

  let result = await runMutation({
    mutation: `updateBlog(_id: "${obj._id}", Updates: { author_UPDATE: { weights_CONCAT: [2.3, 3.4] } }){Blog{ author{name, weights}}}`,
    result: "updateBlog"
  });
  expect(result).toEqual({ author: { name: "Adam", weights: [0.1, 1.9, 2.3, 3.4] } });
});
