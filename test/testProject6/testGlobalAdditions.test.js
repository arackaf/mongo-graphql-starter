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
    query: `{getAddedType(arg: ""){val, val2}}`,
    coll: "getAddedType"
  });

  expect(res.val).toBe("Some Value");
  expect(res.val2).toBe("val2");
});

test("Test addition 2", async () => {
  const res = await runMutation({
    mutation: `updateAddedType(arg: "")`,
    rawResult: "updateAddedType"
  });
});

test("Test addition 3", async () => {
  const res = await runQuery({
    query: `{getAddedType2(arg: ""){val}}`,
    coll: "getAddedType2"
  });

  expect(res.val).toBe("Some Value");
});

test("Test addition 4", async () => {
  const res = await runMutation({
    mutation: `updateAddedType2(arg: "")`,
    rawResult: "updateAddedType2"
  });
});
