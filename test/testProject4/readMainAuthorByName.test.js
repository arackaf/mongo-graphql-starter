import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
let adam, katie, laura, mallory;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  adam = { name: "Adam", birthday: new Date("1982-03-22") };
  katie = { name: "Katie", birthday: new Date("2009-08-05") };
  laura = { name: "Laura", birthday: new Date("1974-12-19") };
  mallory = { name: "Mallory", birthday: new Date("1956-08-02") };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insertOne(person)));

  await db.collection("books").insertOne({ title: "Book 1", pages: 100, mainAuthorName: adam.name });
  await db.collection("books").insertOne({ title: "Book 2", pages: 150, mainAuthorName: adam.name });
  await db.collection("books").insertOne({ title: "Book 3", pages: 200, mainAuthorName: katie.name });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  close();
  db = null;
});

test("Read main author", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "B"){Books{title, mainAuthorByName{name}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", mainAuthorByName: { name: "Adam" } },
      { title: "Book 2", mainAuthorByName: { name: "Adam" } },
      { title: "Book 3", mainAuthorByName: { name: "Katie" } }
    ]
  });
});

test("Read main author - no receiving key", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "B"){Books{title, mainAuthorByName{_id}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", mainAuthorByName: { _id: "" + adam._id } },
      { title: "Book 2", mainAuthorByName: { _id: "" + adam._id } },
      { title: "Book 3", mainAuthorByName: { _id: "" + katie._id } }
    ]
  });
});
