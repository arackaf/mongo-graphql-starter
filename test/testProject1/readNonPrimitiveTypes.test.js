import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db
    .collection("books")
    .insertOne({ title: "Book 10", pages: 10, primaryAuthor: { birthday: new Date("2004-06-03"), name: "Adam R" }, strArrs: [["a"], ["b", "c"]] });
  await db
    .collection("books")
    .insertOne({ title: "Book 100", pages: 100, authors: [{ birthday: new Date("2004-06-02"), name: "Adam" }], strArrs: [["a"], ["b", "c"]] });
  await db.collection("books").insertOne({ title: "Book 150", pages: 150, authors: [{ birthday: new Date("2000-01-02"), name: "Bob" }] });
  await db.collection("books").insertOne({
    title: "Book 200",
    pages: 200,
    authors: [{ birthday: new Date("2004-03-22"), name: "Adam" }, { birthday: new Date("2002-02-03"), name: "Bob" }]
  });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("Fetches primary author", async () => {
  await queryAndMatchArray({
    query: "{allBooks(pages: 10){Books{title, primaryAuthor { birthday, name }}}}",
    coll: "allBooks",
    results: [{ title: "Book 10", primaryAuthor: { birthday: "06/03/2004", name: "Adam R" } }]
  });
});

test("Fetches authors", async () => {
  await queryAndMatchArray({
    query: "{allBooks(pages: 100){Books{title, authors { birthday, name }}}}",
    coll: "allBooks",
    results: [{ title: "Book 100", authors: [{ birthday: "06/02/2004", name: "Adam" }] }]
  });
});

test("Fetches strArrays", async () => {
  await queryAndMatchArray({
    query: "{allBooks(pages: 100){Books{title, strArrs}}}",
    coll: "allBooks",
    results: [{ title: "Book 100", strArrs: [["a"], ["b", "c"]] }]
  });
});

test("Fetches both", async () => {
  await queryAndMatchArray({
    query: "{allBooks(pages: 100){Books{title, strArrs, authors { birthday, name }}}}",
    coll: "allBooks",
    results: [{ title: "Book 100", authors: [{ birthday: "06/02/2004", name: "Adam" }], strArrs: [["a"], ["b", "c"]] }]
  });
});
