import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Modification mutation works", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {
      title: "Book 1", 
      authors: [
        { birthday: "1982-03-22",  name: "Adam" }, 
        { birthday: "1982-03-22", name: "Alan" }, 
        { birthday: "2004-06-02",  name: "Bob" }
      ]
    }){Book{ _id }}`,
    result: "createBook"
  });

  let updated = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: {
      authors_PULL: {name_startsWith: "A"}, 
    }){Book{
      title, 
      authors { 
        birthday, 
        name 
      }
    }}`,
    result: "updateBook"
  });
  expect(updated).toEqual({
    title: "Book 1",
    authors: [{ birthday: "06/02/2004", name: "Bob" }]
  });
});

test("Modification addToSet works", async () => {
  let obj = await runMutation({
    mutation: `createBook(Book: {
      title: "Book 1", 
      authors: [
        { birthday: "1982-03-22",  name: "Adam", strings: ["a", "b"] }, 
        { birthday: "1982-03-22", name: "Alan", strings: [] }, 
        { birthday: "2004-06-02",  name: "Bob", strings: ["a"] }
      ]
    }){Book{ _id }}`,
    result: "createBook"
  });

  let updated = await runMutation({
    mutation: `updateBook(_id: "${obj._id}", Updates: {
      authors_UPDATES: [
        {index: 0, Updates: {strings_ADDTOSET: ["a", "b", "c"]}},
        {index: 1, Updates: {strings_ADDTOSET: ["a", "b", "c"]}},
        {index: 2, Updates: {strings_ADDTOSET: ["a", "b", "c"]}}
      ],
    }){Book{
      title, 
      authors { 
        strings
      }
    }}`,
    result: "updateBook"
  });
  expect(updated).toEqual({
    title: "Book 1",
    authors: [{ strings: ["a", "b", "c"] }, { strings: ["a", "b", "c"] }, { strings: ["a", "b", "c"] }]
  });
});
