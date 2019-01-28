import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  let adam = { name: "Adam", birthday: new Date("1982-03-22") };
  let katie = { name: "Katie", birthday: new Date("2009-08-05") };
  let laura = { name: "Laura", birthday: new Date("1974-12-19") };
  let mallory = { name: "Mallory", birthday: new Date("1956-08-02") };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insertOne(person)));

  let book1 = { title: "Book 1", pages: 100, authorIds: [adam._id] };
  let book2 = { title: "Book 2", pages: 150, authorIds: [adam._id] };
  let book3 = { title: "Book 3", pages: 200, authorIds: [katie._id] };

  await db.collection("books").insertOne(book1);
  await db.collection("books").insertOne(book2);
  await db.collection("books").insertOne(book3);

  await db.collection("authors").updateOne({ _id: ObjectId(adam._id) }, { $set: { firstBookId: book2._id } });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  close();
  db = null;
});

test("Read authors", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "B"){Books{title, authors{name}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", authors: [{ name: "Adam" }] },
      { title: "Book 2", authors: [{ name: "Adam" }] },
      { title: "Book 3", authors: [{ name: "Katie" }] }
    ]
  });
});

test("Read authors' first book", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "B"){Books{title, authors{name, firstBook{title}}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", authors: [{ name: "Adam", firstBook: { title: "Book 2" } }] },
      { title: "Book 2", authors: [{ name: "Adam", firstBook: { title: "Book 2" } }] },
      { title: "Book 3", authors: [{ name: "Katie", firstBook: null }] }
    ]
  });
});
