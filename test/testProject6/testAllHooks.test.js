import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;

const types = ["Type1", "Type2"];
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  let objects = [
    `{ field1: "1 a", field2: "C", autoUpdateField: 1, autoAdjustField: 1, poisonField: 1 }`,
    `{ field1: "2 a", field2: "2 a", autoUpdateField: 2, autoAdjustField: 1, poisonField: 1 }`,
    `{ field1: "3 a", field2: "3 a", autoUpdateField: 3, autoAdjustField: 1, poisonField: 1 }`,
    `{ field1: "4 a", field2: "4 a", autoUpdateField: 4, autoAdjustField: 1, poisonField: 1 }`,
    `{ field1: "5 a", field2: "5 a", autoUpdateField: 5, autoAdjustField: 1, poisonField: 1 }`,
    `{ field1: "no", field2: "2 a", autoUpdateField: 6, autoAdjustField: 1, poisonField: 2 }`,
    `{ field1: "no", field2: "A", autoUpdateField: 7, autoAdjustField: 1, poisonField: 0 }`
  ];
  let staticObjects = [
    { field1: "1 a", field2: "xxx", poisonField: 1, userId: 0 },
    { field1: "1 a", autoAdjustField: 1, field2: "D", poisonField: "a", userId: 0 }
  ];

  for (let o of objects) {
    for (let type of types) {
      await runMutation({
        mutation: `create${type}(${type}: ${o}){${type}{field1, field2, poisonField, userId}}`,
        result: `create${type}`
      });
    }
  }

  for (let o of staticObjects) {
    for (let type of types) {
      await db.collection(type.toLowerCase()).insert(o);
    }
  }
});

afterAll(async () => {
  for (let type of types) {
    await db.collection(type.toLowerCase()).remove({});
  }
  db.close();
  db = null;
});

//pre-insert hooks auto tested by virtue of the userId needing to be right for any of the queries below to be right
test("Test query pre-processor A", async () => {
  await queryAndMatchArray({
    query: `{allType1s(field1: "no"){Type1s{autoAdjustField}}}`,
    coll: "allType1s",
    results: []
  });
});

test("Test query data-adjust 1", async () => {
  await queryAndMatchArray({
    query: `{allType1s(field2: "C"){Type1s{autoAdjustField}}}`,
    coll: "allType1s",
    results: [{ autoAdjustField: 2 }]
  });
});

test("Test query pre-processor 2", async () => {
  await queryAndMatchArray({
    query: `{allType2s(field1: "no"){Type2s{field2, autoAdjustField}}}`,
    coll: "allType2s",
    results: [{ field2: "2 a", autoAdjustField: 3 }]
  });
});

test("Test query middleware 1", async () => {
  await queryAndMatchArray({
    query: `{allType1s(field1: "1 a"){Type1s{field2}}}`,
    coll: "allType1s",
    results: [{ field2: "C" }]
  });
});

test("Test query middleware 2", async () => {
  await queryAndMatchArray({
    query: `{allType2s(field1: "no", SORT: {field2: 1}){Type2s{field2}}}`,
    coll: "allType2s",
    results: [{ field2: "2 a" }]
  });
});

test("Test query update middleware 1", async () => {
  let obj = (await db
    .collection("type1")
    .find({ field2: "A" })
    .toArray())[0];

  obj = await runMutation({
    mutation: `updateType1(_id: "${obj._id}", Type1: { field1: "no" }) {Type1{autoUpdateField, autoAdjustField}}`,
    result: "updateType1"
  });

  expect(obj.autoUpdateField).toBe(8);
  expect(obj.autoAdjustField).toBe(2);
});

test("Test query update middleware 2", async () => {
  let obj = (await db
    .collection("type2")
    .find({ field2: "A" })
    .toArray())[0];

  obj = await runMutation({
    mutation: `updateType2(_id: "${obj._id}", Type2: { field1: "no" }) {Type2{autoUpdateField, autoAdjustField}}`,
    result: "updateType2"
  });

  expect(obj.autoUpdateField).toBe(9);
  expect(obj.autoAdjustField).toBe(3);
});

test("Test query update middleware 3", async () => {
  let obj = (await db
    .collection("type1")
    .find({ field2: "D" })
    .toArray())[0];

  let emptyObj = await runMutation({
    mutation: `updateType1(_id: "${obj._id}", Type1: { field2: "ZZZ" }) {Type1{autoUpdateField, autoAdjustField}}`,
    result: "updateType1"
  });

  expect(emptyObj).toBe(null);

  obj = (await db
    .collection("type1")
    .find({ field2: "D" })
    .toArray())[0];

  expect(obj.field2).toBe("D");
});

test("Test query update middleware 4", async () => {
  let obj = (await db
    .collection("type2")
    .find({ field2: "xxx" })
    .toArray())[0];

  let _id = obj._id;

  let emptyObj = await runMutation({
    mutation: `updateType2(_id: "${obj._id}", Type2: { field2: "yyy" }) {Type2{field1, field2}}`,
    result: "updateType2"
  });

  expect(emptyObj).toBe(null);

  obj = (await db
    .collection("type2")
    .find({ _id })
    .toArray())[0];

  expect(obj.field2).toBe("xxx");
});

test("Test data adjust on insert 1", async () => {
  let obj = await runMutation({
    mutation: `createType1(Type1: { autoAdjustField: 1 }) {Type1{autoAdjustField}}`,
    result: "createType1"
  });

  expect(obj.autoAdjustField).toBe(2);
});

test("Test data adjust on insert 2", async () => {
  let obj = await runMutation({
    mutation: `createType2(Type2: { autoAdjustField: 1 }) {Type2{autoAdjustField}}`,
    result: "createType2"
  });

  expect(obj.autoAdjustField).toBe(3);
});
