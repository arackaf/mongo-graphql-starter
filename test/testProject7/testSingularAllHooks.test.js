import spinUp from "./spinUp";

let db, schema, runQuery, queryAndMatchArray, runMutation, close;

const types = ["Type1", "Type2"];
let type1Objects = [
  { field1: "1 a", field2: "C", autoUpdateField: 1, autoAdjustField: 1, poisonField: 1, userId: 1 },
  { field1: "no", field2: "2 a", autoUpdateField: 6, autoAdjustField: 1, poisonField: 1, userId: 0 },
  { field1: "no", field2: "A", autoUpdateField: 7, autoAdjustField: 1, poisonField: 0, userId: 1 },
  { field1: "1 a", field2: "xxx", poisonField: 1, userId: 0, userId: 3 },
  { field1: "1 a", autoAdjustField: 1, field2: "D", poisonField: "a", userId: 0, userId: 1 }
];
let type2Objects = [
  { field1: "1 a", field2: "C", autoUpdateField: 1, autoAdjustField: 1, poisonField: 2, userId: 2 },
  { field1: "no", field2: "2 a", autoUpdateField: 6, autoAdjustField: 1, poisonField: 1, userId: 3 },
  { field1: "no", field2: "A", autoUpdateField: 7, autoAdjustField: 1, poisonField: 3, userId: 1 },
  { field1: "1 a", field2: "xxx", poisonField: 1, userId: 0, userId: 2 },
  { field1: "1 a", autoAdjustField: 1, field2: "D", poisonField: "a", userId: 0, userId: 2 }
];

beforeAll(async () => {
  ({ db, schema, runQuery, queryAndMatchArray, runMutation, close } = await spinUp());

  for (let o of type1Objects) {
    await db.collection("type1").insertOne(o);
  }
  for (let o of type2Objects) {
    await db.collection("type2").insertOne(o);
  }
});

afterAll(async () => {
  for (let type of types) {
    await db.collection(type.toLowerCase()).deleteMany({});
  }
  close();
  db = null;
});

test("Test query pre-processor 1a", async () => {
  let result = await runQuery({
    query: `{getType1(_id: "${type1Objects[1]._id}"){Type1{autoAdjustField}}}`,
    coll: "getType1"
  });
  expect(result).toEqual({ Type1: null });
});

test("Test query pre-processor 1b", async () => {
  let result = await runQuery({
    query: `{getType1(_id: "${type1Objects[2]._id}"){Type1{autoAdjustField}}}`,
    coll: "getType1"
  });
  expect(result).toEqual({ Type1: null });
});

test("Test query pre-aggregate 1", async () => {
  await queryAndMatchArray({
    query: `{getType1(_id: "591b74d036f369d06bb7781d"){Type1{field2}}}`,
    coll: "getType1",
    results: { field2: "C" }
  });
});

test("Test query pre-aggregate 2", async () => {
  await queryAndMatchArray({
    query: `{getType2(_id: "591b74d036f369d06bb7781d"){Type2{field2}}}`,
    coll: "getType2",
    results: { field2: "A" }
  });
});

test("Test query data-adjust 1", async () => {
  let result = await queryAndMatchArray({
    query: `{getType1(_id: "${type1Objects[0]._id}"){Type1{autoAdjustField}}}`,
    coll: "getType1",
    results: { autoAdjustField: 2 }
  });
});

test("Test query data-adjust 2", async () => {
  let result = await queryAndMatchArray({
    query: `{getType2(_id: "${type2Objects[0]._id}"){Type2{autoAdjustField}}}`,
    coll: "getType2",
    results: { autoAdjustField: 3 }
  });
});

test("Test query pre-processor 2a", async () => {
  let result = await runQuery({
    query: `{getType2(_id: "${type2Objects[1]._id}"){Type2{field2, autoAdjustField}}}`,
    coll: "getType2"
  });
  expect(result).toEqual({ Type2: null });
});

test("Test query pre-processor 2b", async () => {
  let result = await runQuery({
    query: `{getType2(_id: "${type2Objects[2]._id}"){Type2{autoAdjustField}}}`,
    coll: "getType2"
  });
  expect(result).toEqual({ Type2: null });
});
