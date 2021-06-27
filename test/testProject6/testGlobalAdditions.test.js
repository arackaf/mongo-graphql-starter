import spinUp from "./spinUp";

let db, schema, runQuery, queryAndMatchArray, runMutation, close;

beforeAll(async () => {
  ({ db, schema, runQuery, queryAndMatchArray, runMutation, close } = await spinUp());
});

afterAll(async () => {
  close();
});

test("Test addition 1", async () => {
  const res = await runQuery({
    query: `{getAddedType(arg: ""){val}}`,
    coll: "getAddedType"
  });

  expect(res.val).toBe("Some Value");
});

test("Test addition 2", async () => {
  const res = await runMutation({
    mutation: `updateAddedType(arg: "")`,
    rawResult: "updateAddedType"
  });
});
