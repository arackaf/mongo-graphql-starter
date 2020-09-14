import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Has + in title" });
  await db.collection("books").insertOne({ title: "+ at start" });
  await db.collection("books").insertOne({ title: "Ends with +" });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("String startsWith", async () => {
  await queryAndMatchArray({ query: '{allBooks(title_startsWith: "+"){Books{title}}}', coll: "allBooks", results: [{ title: "+ at start" }] });
});

test("String endsWith", async () => {
  await queryAndMatchArray({ query: '{allBooks(title_endsWith: "+"){Books{title}}}', coll: "allBooks", results: [{ title: "Ends with +" }] });
});

test("String contains", async () => {
  await queryAndMatchArray({
    query: '{allBooks(title_contains: "+", SORT: {title: 1}){Books{title}}}',
    coll: "allBooks",
    results: [{ title: "+ at start" }, { title: "Ends with +" }, { title: "Has + in title" }]
  });
});
