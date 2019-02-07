import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Creation mutation runs", async () => {
  await runMutation({ mutation: `createBook(Book: {title: "Book 1", pages: 100}){Book{title, pages}}`, result: "createBook" });
});

test("Creation mutation runs and returns success", async () => {
  let res = await runMutation({ mutation: `createBook(Book: {title: "Book 1", pages: 100}){success}`, rawResult: "createBook" });
  expect(res).toEqual({ success: true });
});

test("Creation mutation runs without selection", async () => {
  await runMutation({ mutation: `createBook(Book: {title: "Book 1", pages: 100}){success}`, result: "createBook" });
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
    mutation: `updateBook(_id: "${obj._id}", Updates: { 
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
    }){Book{
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
    mutation: `updateBook(_id: "${
      obj._id
    }", Updates: {authors: [{birthday: "1982-03-23", name: "Adam R"}, {birthday: "2004-06-03", name: "Bob B"}], primaryAuthor: {birthday: "2000-01-02", name: "Mike"}}){Book{title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}}`,
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
    mutation: `updateBook(_id: "${obj._id}", Updates: {
      title: "Book 2a", 
      pages: 101
    }){Book{
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
    mutation: `updateBook(_id: "${
      obj._id
    }"){Book{title, pages, weight, authors { birthday, name }, primaryAuthor{ birthday, name }, strArrs, createdOn, createdOnYearOnly}}`,
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

//-----------------------------------------------------------------------------------------

test("float array update", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", prices: [1.1, 2.9]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: { prices_UPDATE: {index: 1, value: 2.2 }}) {Book{title, prices}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", prices: [1.1, 2.2] });
});

test("float array updates", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", prices: [1.1, 2.9]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: { prices_UPDATES: [{index: 0, value: 1.0}, {index: 1, value: 2.2}] }) {Book{title, prices}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", prices: [1.0, 2.2] });
});

test("float array pull", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", prices: [1.1, 2.2, 3.3]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: { prices_PULL: [1.1, 3.3] }) {Book{title, prices}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", prices: [2.2] });
});

test("float array add to set", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", prices: [1.1, 2.2, 3.3]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: { prices_ADDTOSET: [1.1, 3.3, 3.3, 4.4] }) {Book{title, prices}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", prices: [1.1, 2.2, 3.3, 4.4] });
});

//-----------------------------------------------------------------------------------------

test("bool update", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", isRead: true}){Book{_id, isRead}}`,
    result: "createBook"
  });
  expect(obj.isRead).toEqual(true);

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: { isRead: false }) {Book{title, isRead}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", isRead: false });
});

//-----------------------------------------------------------------------------------------

test("int array update", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", editions: [6, 10]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: { editions_UPDATE: {index: 1, value: 11} }) {Book{title, editions}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", editions: [6, 11] });
});

test("int array updates", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", editions: [6, 10]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: {editions_UPDATES: [{index: 0, value: 7}, {index: 1, value: 11}] }) {Book{title, editions}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", editions: [7, 11] });
});

test("int array pull", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", editions: [4, 6, 10]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: { editions_PULL: [4, 6] }) {Book{title, editions}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", editions: [10] });
});

test("int array add to set", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", editions: [4, 6, 10]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: { editions_ADDTOSET: [4, 6, 11] }) {Book{title, editions}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", editions: [4, 6, 10, 11] });
});

//-----------------------------------------------------------------------------------------

test("string array update", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", keywords: ["c", "d"]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: {keywords_UPDATE: {index: 1, value: "b"} }) {Book{title, keywords}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", keywords: ["c", "b"] });
});

test("string array updates", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", keywords: ["c", "d"]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: {keywords_UPDATES: [{index: 0, value: "a"}, {index: 1, value: "b"}] }) {Book{title, keywords}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", keywords: ["a", "b"] });
});

test("string array pull", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", keywords: ["c", "d", "e"]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: { keywords_PULL: ["c", "e"] }) {Book{title, keywords}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", keywords: ["d"] });
});

test("string array add to set", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", keywords: ["c", "d", "e"]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: { keywords_ADDTOSET: ["c", "d", "e", "f"] }) {Book{title, keywords}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", keywords: ["c", "d", "e", "f"] });
});

//-----------------------------------------------------------------------------------------

const id1 = ObjectId("59ff9b246d61043f186dcfed");
const id2 = ObjectId("59ff9b246d61043f186dcfee");
const id3 = ObjectId("59ff9b246d61043f186dcfef");
const idCrap = ObjectId("59ff9b246d61043f186dcfe9");

test("Manual mongoId", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {_id: "${idCrap}" title: "Book temp"}){Book{_id}}`,
    result: "createBook"
  });

  expect(obj._id).toBe("" + idCrap);

  await queryAndMatchArray({
    query: `{getBook(_id: "${idCrap}"){Book{title}}}`,
    coll: "getBook",
    results: { title: "Book temp" }
  });

  await runMutation({
    mutation: `deleteBook(_id: "${idCrap}"){success}`,
    result: "deleteBook"
  });
});

test("MongoId array update", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", mongoIds: ["${id2}", "${idCrap}"]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: {mongoIds_UPDATE: {index: 1, value: "${id3}"} }) {Book{title, mongoIds}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", mongoIds: ["" + id2, "" + id3] });
});

test("MongoId array updates", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", mongoIds: ["${id3}", "${idCrap}"]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${
      obj._id
    }", Updates: {mongoIds_UPDATES: [{index: 0, value: "${id1}"}, {index: 1, value: "${id2}"}] }) {Book{title, mongoIds}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", mongoIds: ["" + id1, "" + id2] });
});

test("MongoId array pull", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", mongoIds: ["${id1}", "${id2}", "${id3}"]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: { mongoIds_PULL: ["${id2}", "${id3}"] }) {Book{title, mongoIds}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", mongoIds: ["" + id1] });
});

test("MongoId array add to set", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {title: "Book 1", mongoIds: ["${id1}", "${id2}", "${id3}"]}){Book{_id}}`,
    result: "createBook"
  });

  obj = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: { mongoIds_ADDTOSET: ["${id2}", "${id3}", "${idCrap}"] }) {Book{title, mongoIds}}`,
    result: "updateBook"
  });

  expect(obj).toEqual({ title: "Book 1", mongoIds: ["" + id1, "" + id2, "" + id3, "" + idCrap] });
});

//-----------------------------------------------------------------------------------------
