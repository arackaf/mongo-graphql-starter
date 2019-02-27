import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1", keywords: ["+ and ?"] });
  await db.collection("books").insertOne({ title: "Book 2", keywords: ["+ and ?", "?"] });
  await db.collection("books").insertOne({ title: "Book 3", keywords: ["? foo"] });
  await db.collection("books").insertOne({ title: "Book 4", keywords: ["ends +"] });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("String array match - contains", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords_textContains: "?", SORT: {title: 1}){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Book 1" }, { title: "Book 2" }, { title: "Book 3" }]
  });
});

test("String array match - starts with", async () => {
  await queryAndMatchArray({
    query: '{allBooks(keywords_startsWith: "?", SORT: {title: 1}){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "Book 2" }, { title: "Book 3" }]
  });
});

test("String array match - ends with", async () => {
  await queryAndMatchArray({
    query: `{allBooks(keywords_endsWith: "+", SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Book 4" }]
  });
});
