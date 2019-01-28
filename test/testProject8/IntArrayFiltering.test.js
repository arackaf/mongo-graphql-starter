import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("things").insertOne({ name: "a", ints: [] });
  await db.collection("things").insertOne({ name: "b", ints: [1, 2, 3, 4] });
  await db.collection("things").insertOne({ name: "c", ints: [3, 4, 5, 6] });
  await db.collection("things").insertOne({ name: "d", ints: [5] });
  await db.collection("things").insertOne({ name: "e", ints: [5, 6] });
});

afterAll(async () => {
  await db.collection("things").deleteMany({});
  close();
  db = null;
});

test("Int Array - adv match 1", async () => {
  await queryAndMatchArray({
    query: "{allThings(ints_lt: 5, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "b" }, { name: "c" }]
  });
});

test("Int Array - adv match 2", async () => {
  await queryAndMatchArray({
    query: "{allThings(ints_lte: 5, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "b" }, { name: "c" }, { name: "d" }, { name: "e" }]
  });
});

test("Int Array - adv match 3", async () => {
  await queryAndMatchArray({
    query: "{allThings(ints_lt: 5, ints_lte: 5, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "b" }, { name: "c" }]
  });
});

test("Int Array - adv match 4", async () => {
  await queryAndMatchArray({
    query: "{allThings(ints_gt: 5, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "e" }]
  });
});

test("Int Array - adv match 5", async () => {
  await queryAndMatchArray({
    query: "{allThings(ints_gte: 5, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "d" }, { name: "e" }]
  });
});

test("Int Array - adv match 6", async () => {
  await queryAndMatchArray({
    query: "{allThings(ints_gte: 5, ints_lt: 6 SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "d" }, { name: "e" }]
  });
});

// ---------------------------------- em -----------------------------------

test("Int Array - adv match 7", async () => {
  await queryAndMatchArray({
    query: "{allThings(ints_emgte: 6, ints_emlte: 6, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "e" }]
  });
});

test("Int Array - adv match 8", async () => {
  await queryAndMatchArray({
    query: "{allThings(ints_emgt: 4, ints_emlt: 6, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "d" }, { name: "e" }]
  });
});

test("Int Array - adv match 7", async () => {
  await queryAndMatchArray({
    query: "{allThings(ints_gt: 0, ints_lt: 10, ints_emgte: 6, ints_emlte: 6, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "e" }]
  });
});

test("Int Array - adv match 8", async () => {
  await queryAndMatchArray({
    query: "{allThings(ints_gt: 0, ints_lt: 10, ints_emgt: 4, ints_emlt: 6, SORT: {name: 1}){Things{name}}}",
    coll: "allThings",
    results: [{ name: "c" }, { name: "d" }, { name: "e" }]
  });
});
