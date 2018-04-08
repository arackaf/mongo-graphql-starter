import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation;
let adam, katie, laura, mallory, book1, book2, book3;

beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());
});

afterEach(async () => {
  await db.collection("books").remove({});
  await db.collection("authors").remove({});
  db.close();
  db = null;
});

// --------------------------------- Create Single --------------------------------------------

test("UpdateSingle - Basic add single new author in new book", async () => {
  let newBook = await runMutation({
    mutation: `createBook(Book: {authors: { name: "New Author" }}){Book{title, authors{name}}}`,
    result: "createBook"
  });
});
