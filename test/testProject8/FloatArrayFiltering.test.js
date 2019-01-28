import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("things").insertOne({ name: "a", floats: [] });
  await db.collection("things").insertOne({ name: "b", floats: [1, 2, 3, 4] });
  await db.collection("things").insertOne({ name: "c", floats: [3, 4, 5, 6] });
  await db.collection("things").insertOne({ name: "d", floats: [5] });
  await db.collection("things").insertOne({ name: "e", floats: [5, 6] });
});

afterAll(async () => {
  await db.collection("things").deleteMany({});
  close();
  db = null;
});

test("Int Array - adv match 1", async () => {
  await queryAndMatchArray({
    query: "{allThings(floats_lt: 5, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "b" }, { name: "c" }]
  });
});

test("Int Array - adv match 2", async () => {
  await queryAndMatchArray({
    query: "{allThings(floats_lte: 5, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "b" }, { name: "c" }, { name: "d" }, { name: "e" }]
  });
});

test("Int Array - adv match 3", async () => {
  await queryAndMatchArray({
    query: "{allThings(floats_lt: 5, floats_lte: 5, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "b" }, { name: "c" }]
  });
});

test("Int Array - adv match 4", async () => {
  await queryAndMatchArray({
    query: "{allThings(floats_gt: 5, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "e" }]
  });
});

test("Int Array - adv match 5", async () => {
  await queryAndMatchArray({
    query: "{allThings(floats_gte: 5, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "d" }, { name: "e" }]
  });
});

test("Int Array - adv match 6", async () => {
  await queryAndMatchArray({
    query: "{allThings(floats_gte: 5, floats_lt: 6 SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "d" }, { name: "e" }]
  });
});

// ---------------------------------- em -----------------------------------

test("Int Array - adv match 7", async () => {
  await queryAndMatchArray({
    query: "{allThings(floats_emgte: 6, floats_emlte: 6, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "e" }]
  });
});

test("Int Array - adv match 8", async () => {
  await queryAndMatchArray({
    query: "{allThings(floats_emgt: 4, floats_emlt: 6, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "d" }, { name: "e" }]
  });
});

test("Int Array - adv match 7", async () => {
  await queryAndMatchArray({
    query: "{allThings(floats_gt: 0, floats_lt: 10, floats_emgte: 6, floats_emlte: 6, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "e" }]
  });
});

test("Int Array - adv match 8", async () => {
  await queryAndMatchArray({
    query: "{allThings(floats_gt: 0, floats_lt: 10, floats_emgt: 4, floats_emlt: 6, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "d" }, { name: "e" }]
  });
});
