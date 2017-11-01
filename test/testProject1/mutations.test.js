import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;
});

test("Creation mutation runs", async () => {
  await runMutation({ mutation: `createBook(Book: {title: "Book 1", pages: 100}){Book{title, pages}}`, result: "createBook" });
});

test("Creation mutation runs and returns object", async () => {
  let obj = await runMutation({ mutation: `createBook(Book: {title: "Book 2", pages: 100}){Book{title, pages}}`, result: "createBook" });
  expect(obj).toEqual({ title: "Book 2", pages: 100 });
});

test("Creation mutation runs and returns object, then searched with graphQL", async () => {
  let obj = await runMutation({ mutation: `createBook(Book: {title: "Book 3", pages: 150}){Book{_id}}`, result: "createBook" });
  await queryAndMatchArray({
    query: `{getBook(_id: "${obj._id}"){Book{title, pages}}}`,
    coll: "getBook",
    results: { title: "Book 3", pages: 150 }
  });
});

test("Creation mutation runs and returns object, then searched with graphQL. Check non-created fields", async () => {
  let obj = await runMutation({ mutation: `createBook(Book: {title: "Book 3", pages: 150}){Book{_id}}`, result: "createBook" });
  await queryAndMatchArray({
    query: `{getBook(_id: "${obj._id}"){Book{title, pages, weight}}}`,
    coll: "getBook",
    results: { title: "Book 3", pages: 150, weight: null }
  });
});

test("Creation mutation runs and returns object with formatting", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 2", pages: 100, weight: 1.2, authors: [{birthday: "1982-03-22", name: "Adam"}, {birthday: "2004-06-02", name: "Bob"}], primaryAuthor: {birthday: "2004-06-02", name: "Bob"}, strArrs: [["a"], ["b", "c"]], createdOn: "2004-06-03", createdOnYearOnly: "2004-06-03"}){Book{title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}}`,
    result: "createBook"
  });
  expect(obj).toEqual({
    title: "Book 2",
    pages: 100,
    weight: 1.2,
    authors: [{ birthday: "03/22/1982", name: "Adam" }, { birthday: "06/02/2004", name: "Bob" }],
    primaryAuthor: { birthday: "06/02/2004", name: "Bob" },
    strArrs: [["a"], ["b", "c"]],
    createdOn: "06/03/2004",
    createdOnYearOnly: "2004"
  });
});

test("Modification mutation works", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {
      title: "Book 2", 
      pages: 100, 
      weight: 1.2, 
      authors: [
        {
          birthday: "1982-03-22", 
          name: "Adam"
        }, 
        {
          birthday: "2004-06-02", 
          name: "Bob"
        }
      ], 
      primaryAuthor: {
        birthday: "2004-06-02", 
        name: "Bob"
      }, 
      strArrs: [["a"], ["b", "c"]], 
      createdOn: "2004-06-03", 
      createdOnYearOnly: "2004-06-03"
    }){Book{
      _id, 
      title, 
      pages, 
      weight, 
      authors { 
        birthday, 
        name 
      }, 
      primaryAuthor{ 
        birthday, 
        name 
      }, 
      strArrs, 
      createdOn, 
      createdOnYearOnly
    }}`,
    result: "createBook"
  });

  let updated = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Book: { 
      title: "Book 2a", 
      pages: 101, 
      weight: 1.3, 
      authors: [
        {birthday: "1982-03-23", name: "Adam R"}, 
        {birthday: "2004-06-03", name: "Bob B"}
      ], 
      primaryAuthor: {birthday: "2000-01-02", name: "Mike"}, 
      strArrs: [["d"], ["e", "f"]], 
      createdOn: "2004-06-04", 
      createdOnYearOnly: "2004-06-05"
    }){
      title, 
      pages, 
      weight, 
      authors { 
        birthday, 
        name 
      }, 
      primaryAuthor{ 
        birthday, 
        name 
      }, 
      strArrs, 
      createdOn, 
      createdOnYearOnly
    }`,
    result: "updateBook"
  });
  expect(updated).toEqual({
    title: "Book 2a",
    pages: 101,
    weight: 1.3,
    authors: [{ birthday: "03/23/1982", name: "Adam R" }, { birthday: "06/03/2004", name: "Bob B" }],
    primaryAuthor: { birthday: "01/02/2000", name: "Mike" },
    strArrs: [["d"], ["e", "f"]],
    createdOn: "06/04/2004",
    createdOnYearOnly: "2004"
  });
});

test("Modification mutation works", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {authors: [{birthday: "1982-03-22", name: "Adam"}], primaryAuthor: {birthday: "2004-06-02", name: "Bob"}}){Book{_id, title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}}`,
    result: "createBook"
  });

  let updated = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Book: {authors: [{birthday: "1982-03-23", name: "Adam R"}, {birthday: "2004-06-03", name: "Bob B"}], primaryAuthor: {birthday: "2000-01-02", name: "Mike"}}){title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}`,
    result: "updateBook"
  });
  expect(updated).toEqual({
    title: null,
    pages: null,
    weight: null,
    authors: [{ birthday: "03/23/1982", name: "Adam R" }, { birthday: "06/03/2004", name: "Bob B" }],
    primaryAuthor: { birthday: "01/02/2000", name: "Mike" },
    strArrs: null,
    createdOn: null,
    createdOnYearOnly: null
  });
});

test("Partial modification mutation works", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {
      title: "Book 2", 
      pages: 100, 
      weight: 1.2, 
      authors: [
        {birthday: "1982-03-22", name: "Adam"}, 
        {birthday: "2004-06-02", name: "Bob"}
      ], 
      primaryAuthor: {birthday: "2004-06-02", name: "Bob"}, 
      strArrs: [["a"], ["b", "c"]], 
      createdOn: "2004-06-03", 
      createdOnYearOnly: "2004-06-03"
    }){Book{
      _id, 
      title, 
      pages, 
      weight, 
      authors { 
        birthday, 
        name 
      }, 
      primaryAuthor{ 
        birthday, 
        name 
      }, 
      strArrs, 
      createdOn, 
      createdOnYearOnly
    }}`,
    result: "createBook"
  });

  let updated = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Book: {
      title: "Book 2a", 
      pages: 101
    }){
      title, 
      pages, 
      weight, 
      authors { 
        birthday, 
        name 
      }, 
      primaryAuthor{ 
        birthday, 
        name 
      }, 
      strArrs, 
      createdOn, 
      createdOnYearOnly
    }`,
    result: "updateBook"
  });
  expect(updated).toEqual({
    title: "Book 2a",
    pages: 101,
    weight: 1.2,
    authors: [{ birthday: "03/22/1982", name: "Adam" }, { birthday: "06/02/2004", name: "Bob" }],
    primaryAuthor: { birthday: "06/02/2004", name: "Bob" },
    strArrs: [["a"], ["b", "c"]],
    createdOn: "06/03/2004",
    createdOnYearOnly: "2004"
  });
});

test("No modification mutation works", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 2", pages: 100, weight: 1.2, authors: [{birthday: "1982-03-22", name: "Adam"}, {birthday: "2004-06-02", name: "Bob"}], primaryAuthor: {birthday: "2004-06-02", name: "Bob"}, strArrs: [["a"], ["b", "c"]], createdOn: "2004-06-03", createdOnYearOnly: "2004-06-03"}){Book{_id, title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}}`,
    result: "createBook"
  });

  let updated = await runMutation({
    mutation: `updateBook(_id: "${obj._id}"){title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}`,
    result: "updateBook"
  });
  expect(updated).toEqual({
    title: "Book 2",
    pages: 100,
    weight: 1.2,
    authors: [{ birthday: "03/22/1982", name: "Adam" }, { birthday: "06/02/2004", name: "Bob" }],
    primaryAuthor: { birthday: "06/02/2004", name: "Bob" },
    strArrs: [["a"], ["b", "c"]],
    createdOn: "06/03/2004",
    createdOnYearOnly: "2004"
  });
});
