import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  let adam = { name: "Adam", birthday: new Date("1982-03-22") };
  let katie = { name: "Katie", birthday: new Date("2009-08-05") };
  let laura = { name: "Laura", birthday: new Date("1974-12-19") };
  let mallory = { name: "Mallory", birthday: new Date("1956-08-02") };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insert(person)));

  await db.collection("books").insert({ title: "Book 1", pages: 100, mainAuthorName: adam.name });
  await db.collection("books").insert({ title: "Book 2", pages: 150, mainAuthorName: adam.name });
  await db.collection("books").insert({ title: "Book 3", pages: 200, mainAuthorName: katie.name });
});

afterAll(async () => {
  await db.collection("books").remove({});
  await db.collection("authors").remove({});
  db.close();
  db = null;
});

test("Read authors", async () => {
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
