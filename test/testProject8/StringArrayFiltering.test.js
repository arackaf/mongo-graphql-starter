import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  await db.collection("things").insert({ name: "a", strs: [] });
  await db.collection("things").insert({ name: "b", strs: ["adam", "bob", "brian"] });
  await db.collection("things").insert({ name: "c", strs: ["mike"] });
});

afterAll(async () => {
  await db.collection("things").remove({});
  db.close();
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
