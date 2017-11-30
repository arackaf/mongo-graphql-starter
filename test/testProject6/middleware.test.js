import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;

const types = ["Type1", "Type2"];
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  let objects = [
    `{ field1: "1 a", field2: "C", autoUpdateField: 1, poisonField: 1 }`,
    `{ field1: "2 a", field2: "2 a", autoUpdateField: 2, poisonField: 1 }`,
    `{ field1: "3 a", field2: "3 a", autoUpdateField: 3, poisonField: 1 }`,
    `{ field1: "4 a", field2: "4 a", autoUpdateField: 4, poisonField: 1 }`,
    `{ field1: "5 a", field2: "5 a", autoUpdateField: 5, poisonField: 1 }`,
    `{ field1: "no", field2: "2 a", autoUpdateField: 6, poisonField: 2 }`,
    `{ field1: "no", field2: "A", autoUpdateField: 7, poisonField: 0 }`
  ];
  let staticObjects = [{ field1: "1 a", field2: "xxx", poisonField: "a", userId: 2 }, { field1: "1 a", field2: "D", poisonField: "a", userId: 0 }];

  for (let o in objects) {
    for (let type in types) {
      await runMutation({
        mutation: `create${type}(${type}: ${o}){Type1{field1, field2, poisonField, userId}}`,
        result: `create${type}`
      });
    }
  }

  for (let o in staticObjects) {
    for (let type in types) {
      await db.collection(type).insert(o);
    }
  }
});

afterAll(async () => {
  for (let o in staticObjects) {
    for (let type in types) {
      await db.collection(type).remove({});
    }
  }
  db.close();
  db = null;

  middleware.clearAll();
});

//pre-insert hooks auto tested by virtue of the userId needing to be right for any of the queries below to be right

test("Test query pre-processor 1", async () => {
  await queryAndMatchArray({
    query: `{allType1s(field1: "no"){Type1{title, pages}}}`,
    coll: "allType1s",
    results: []
  });
});

test("Test query pre-processor 2", async () => {
  await queryAndMatchArray({
    query: `{allType2s(field1: "no"){Type1{field2}}}`,
    coll: "allType2s",
    results: [{ field2: "A" }]
  });
});

test("Test query middleware 1", async () => {
  await queryAndMatchArray({
    query: `{allType1s(field1: "1 a"){Type1{field2}}}`,
    coll: "allType1s",
    results: [{ field2: "C" }]
  });
});

test("Test query middleware 2", async () => {
  await queryAndMatchArray({
    query: `{allType2s(field1: "no", SORT: {field2: 1}){Type2{field2}}}`,
    coll: "allType2s",
    results: [{ field2: "C" }, { field2: "D" }]
  });
});

test("Test query update middleware 1", async () => {
  let obj = (await db
    .collection("Type1")
    .find({ field2: "A" })
    .toArray())[0];

  obj = await runMutation({
    mutation: `updateType1(_id: "${obj._id}", Type1: { field1: "no" }) {Type1{autoUpdateField}}`,
    result: "updateBook"
  });

  expect(obj.autoUpdateField).toBe(8);
});

test("Test query update middleware 2", async () => {
  let obj = (await db
    .collection("Type2")
    .find({ field2: "A" })
    .toArray())[0];

  obj = await runMutation({
    mutation: `updateType2(_id: "${obj._id}", Type2: { field1: "no" }) {Type2{autoUpdateField}}`,
    result: "updateBook"
  });

  expect(obj.autoUpdateField).toBe(9);
});
