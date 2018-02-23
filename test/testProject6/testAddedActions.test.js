import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;

beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());
});

afterAll(async () => {
  db.close();
});

test("Test overridden query", async () => {
  let results = await runMutation({
    mutation: `getCoordinate(_id: "5a510abf9491f39a19e2d9ef"){x, y}`,
    result: `getCoordinate`
  });

  expect(results).toEqual({ x: -1, y: -2 });
});

test("Test overridden mutation", async () => {
  let results = await runMutation({
    mutation: `updateCoordinate(_id: "5a510abf9491f39a19e2d9ef", Updates: {}){x, y}`,
    result: `updateCoordinate`
  });

  expect(results).toEqual([{ x: 1, y: 2 }, { x: 3, y: 4 }]);
});

test("Test added mutation", async () => {
  let results = await runMutation({
    mutation: `randomMutation{x, y}`,
    result: `randomMutation`
  });

  expect(results).toEqual({ x: 5, y: 6 });
});

test("Test added query", async () => {
  let results = await runMutation({
    mutation: `randomQuery{x, y}`,
    result: `randomQuery`
  });

  expect(results).toEqual({ x: 7, y: 8 });
});
