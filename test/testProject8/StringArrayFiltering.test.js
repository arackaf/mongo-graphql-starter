import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  await db.collection("things").insert({ name: "a", strs: [] });
  await db.collection("things").insert({ name: "b", strs: ["adam", "bob", "brian"] });
});

afterAll(async () => {
  await db.collection("things").remove({});
  db.close();
  db = null;
});

test("Int Array - adv match 1", async () => {
  await queryAndMatchArray({
    query: `{allThings(strs_textcontains: "a", SORT: {name: 1}){Things{name}}}`,
    coll: "allThings",
    results: [{ name: "b" }]
  });
});
