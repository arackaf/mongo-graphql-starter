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

test("Manual query arg", async () => {
  await queryAndMatchArray({
    query: `{allThings(ManualArg: "X", SORT: {name: 1}){Things{name}}}`,
    coll: "allThings",
    results: [{ name: "a" }, { name: "b" }, { name: "c" }]
  });
});
