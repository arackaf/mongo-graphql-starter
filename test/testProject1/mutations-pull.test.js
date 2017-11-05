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
    mutation: `updateBook(_id: "${obj._id}", Book: {
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
