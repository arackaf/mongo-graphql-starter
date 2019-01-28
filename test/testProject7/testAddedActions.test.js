import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
let item = { x: 5, y: 6, userId: 1 }; //userId to make the rest of the middleware happy :\

const pointAbove = { x: 10, y: 11 };
const allNeighbors = [{ x: 12, y: 13 }, { x: 14, y: 15 }];

beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());
  await db.collection("coordinates").insertOne(item);
});

afterAll(async () => {
  await db.collection("coordinates").deleteMany({});
  close();
});

test("Test overridden query", async () => {
  await queryAndMatchArray({
    query: `{getCoordinate(_id: "5a510abf9491f39a19e2d9ef"){x, y}}`,
    coll: "getCoordinate",
    results: [{ x: -1, y: -2 }, { x: -3, y: -4 }],
    rawResult: true
  });
});

test("Test custom field with overridden query", async () => {
  await queryAndMatchArray({
    query: `{getCoordinate(_id: "5a510abf9491f39a19e2d9ef"){x, y, pointAbove{x,y}, allNeighbors{x,y}}}`,
    coll: "getCoordinate",
    results: [{ x: -1, y: -2, pointAbove, allNeighbors }, { x: -3, y: -4, pointAbove, allNeighbors }],
    rawResult: true
  });
});

test("Test custom field with regular query", async () => {
  await queryAndMatchArray({
    query: `{allCoordinates(x: 5){Coordinates{x, y, pointAbove{x,y}, allNeighbors{x,y}}}}`,
    coll: "allCoordinates",
    results: [{ x: 5, y: 6, pointAbove, allNeighbors }]
  });
});

test("Test overridden mutation", async () => {
  let results = await runMutation({
    mutation: `updateCoordinate(_id: "5a510abf9491f39a19e2d9ef", Updates: {}){x, y}`,
    rawResult: `updateCoordinate`
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
  await queryAndMatchArray({
    query: `{randomQuery{x, y}}`,
    coll: "randomQuery",
    results: { x: 7, y: 8 }
  });
});
