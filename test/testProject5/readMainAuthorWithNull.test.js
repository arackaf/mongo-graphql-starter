import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  let adam = { name: "Adam", birthday: new Date("1982-03-22") };
  let katie = { name: "Katie", birthday: new Date("2009-08-05") };
  let laura = { name: "Laura", birthday: new Date("1974-12-19") };
  let mallory = { name: "Mallory", birthday: new Date("1956-08-02") };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insertOne(person)));

  await db.collection("books").insertOne({ title: "Book 1", pages: 100, mainAuthorId: adam._id });
  await db.collection("books").insertOne({ title: "Book 2", pages: 150 });
  await db.collection("books").insertOne({ title: "Book 3", pages: 200, mainAuthorId: katie._id });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  close();
  db = null;
});

test("Read authors", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "B"){Books{title, mainAuthor{name}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", mainAuthor: { name: "Adam" } },
      { title: "Book 2", mainAuthor: null },
      { title: "Book 3", mainAuthor: { name: "Katie" } }
    ]
  });
});
