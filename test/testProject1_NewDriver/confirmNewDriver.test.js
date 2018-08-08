import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());
});

afterAll(async () => {
  close();
  db = null;
});

test("Using mongodb 3", async () => {
  expect(typeof db.close).toBe("undefined");
});
