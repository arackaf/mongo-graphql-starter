import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("things").insertOne({ name: "a", strs: [] });
  await db.collection("things").insertOne({ name: "b", strs: ["adam", "bob", "brian"] });
  await db.collection("things").insertOne({ name: "c", strs: ["mike"] });
});

afterAll(async () => {
  await db.collection("things").deleteMany({});
  close();
  db = null;
});

test("Str Array - text contains", async () => {
  await queryAndMatchArray({
    query: `{allThings(strs_textContains: "a", SORT: {name: 1}){Things{name}}}`,
    coll: "allThings",
    results: [{ name: "b" }]
  });
});

test("Str Array - starts with 1", async () => {
  await queryAndMatchArray({
    query: `{allThings(strs_startsWith: "a", SORT: {name: 1}){Things{name}}}`,
    coll: "allThings",
    results: [{ name: "b" }]
  });
});

test("Str Array - starts with 2", async () => {
  await queryAndMatchArray({
    query: `{allThings(strs_startsWith: "b", SORT: {name: 1}){Things{name}}}`,
    coll: "allThings",
    results: [{ name: "b" }]
  });
});

test("Str Array - ends with 1", async () => {
  await queryAndMatchArray({
    query: `{allThings(strs_endsWith: "e", SORT: {name: 1}){Things{name}}}`,
    coll: "allThings",
    results: [{ name: "c" }]
  });
});
