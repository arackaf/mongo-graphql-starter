import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
let objA;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  objA = { name: "a", strs: [] };
  await db.collection("things").insertOne(objA);
  await db.collection("things").insertOne({ name: "b", strs: ["adam", "bob", "brian"] });
  await db.collection("things").insertOne({ name: "c", strs: ["mike"] });
});

afterAll(async () => {
  await db.collection("things").deleteMany({});
  close();
  db = null;
});

test("Manual query arg", async () => {
  await queryAndMatchArray({
    query: `{allThings(ManualArg: "X", SORT: {name: 1}){Things{name}}}`,
    coll: "allThings",
    results: [{ name: "a" }, { name: "b" }, { name: "c" }]
  });
});

test("Manual query arg on single", async () => {
  await queryAndMatchArray({
    query: `{getThing(_id: "${objA._id}", ManualArg: "X"){Thing{name}}}`,
    coll: "getThing",
    results: { name: "a" }
  });
});
