import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;

const types = ["Type1", "Type2"];
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

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
    { field1: "G", field2: "W", poisonField: 2, userId: 2, autoAdjustField: 1 },
    { field1: "1 a", field2: "xxx", poisonField: 1, userId: 0 },
    { field1: "1 a", autoAdjustField: 1, field2: "D", poisonField: "a", userId: 0 },
    { field1: "1 a", autoAdjustField: 1, field2: "D", poisonField: "a", userId: 0 },
    { field1: "X", autoAdjustField: 1, field2: "D", poisonField: "a", userId: -1 },
    { field1: "no", autoAdjustField: 1, field2: "D", poisonField: 1, userId: 0 },
    { field1: "no", autoAdjustField: 1, field2: "D", poisonField: 2, userId: 0 },
    { field1: "no", autoAdjustField: 1, field2: "D", poisonField: 0, userId: 0 }
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
      await db.collection(type.toLowerCase()).insertOne(o);
    }
  }
});

afterAll(async () => {
  for (let type of types) {
    await db.collection(type.toLowerCase()).deleteMany({});
  }
  await db.collection("insertInfo").deleteMany({});
  await db.collection("updateInfo").deleteMany({});
  await db.collection("deleteInfo").deleteMany({});
  close();
  db = null;
});

//pre-insert hooks auto tested by virtue of the userId needing to be right for any of the queries below to be right
test("Test query pre-processor 1", async () => {
  await queryAndMatchArray({
    query: `{allType1s(field1: "no"){Type1s{autoAdjustField}}}`,
    coll: "allType1s",
    results: []
  });
});

test("Test query pre-processor 2", async () => {
  await queryAndMatchArray({
    query: `{allType2s(field1: "no"){Type2s{field2, autoAdjustField}}}`,
    coll: "allType2s",
    results: [{ field2: "2 a", autoAdjustField: 3 }]
  });
});

test("Test query pre-aggregate 1", async () => {
  await queryAndMatchArray({
    query: `{allType1s(field2: "ADJUST"){Type1s{field2}}}`,
    coll: "allType1s",
    results: [{ field2: "C" }]
  });
});

test("Test query pre-aggregate 2", async () => {
  await queryAndMatchArray({
    query: `{allType2s(field2: "ADJUST"){Type2s{field2}}}`,
    coll: "allType2s",
    results: [{ field2: "A" }]
  });
});

test("Test query data-adjust 1", async () => {
  await queryAndMatchArray({
    query: `{allType1s(field2: "C"){Type1s{autoAdjustField}}}`,
    coll: "allType1s",
    results: [{ autoAdjustField: 2 }]
  });
});

test("Test query data-adjust 2", async () => {
  await queryAndMatchArray({
    query: `{allType2s(field2: "W"){Type2s{autoAdjustField}}}`,
    coll: "allType2s",
    results: [{ autoAdjustField: 3 }]
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

test("Test query before update 1", async () => {
  let obj = (await db
    .collection("type1")
    .find({ field2: "A" })
    .toArray())[0];

  obj = await runMutation({
    mutation: `updateType1(_id: "${obj._id}", Updates: { field1: "ABC123" }) {Type1{autoUpdateField, autoAdjustField}}`,
    result: "updateType1"
  });

  expect(obj).toBe(null);
});

test("Test query before update 2", async () => {
  let obj = (await db
    .collection("type2")
    .find({ field2: "A" })
    .toArray())[0];

  obj = await runMutation({
    mutation: `updateType2(_id: "${obj._id}", Updates: { field1: "XYZ123" }) {Type2{autoUpdateField, autoAdjustField}}`,
    result: "updateType2"
  });

  expect(obj).toBe(null);
});

test("Test query update middleware and auto adjust 1", async () => {
  let obj = (await db
    .collection("type1")
    .find({ field2: "A" })
    .toArray())[0];

  obj = await runMutation({
    mutation: `updateType1(_id: "${obj._id}", Updates: { field1: "no" }) {Type1{autoUpdateField, autoAdjustField}}`,
    result: "updateType1"
  });

  expect(obj.autoUpdateField).toBe(8);
  expect(obj.autoAdjustField).toBe(2);
});

test("Test query update middleware and auto adjust 2", async () => {
  let obj = (await db
    .collection("type2")
    .find({ field2: "A" })
    .toArray())[0];

  obj = await runMutation({
    mutation: `updateType2(_id: "${obj._id}", Updates: { field1: "no" }) {Type2{autoUpdateField, autoAdjustField}}`,
    result: "updateType2"
  });

  expect(obj.autoUpdateField).toBe(9);
  expect(obj.autoAdjustField).toBe(3);
});

test("Test query update middleware 3 and auto adjust", async () => {
  let obj = (await db
    .collection("type1")
    .find({ field2: "D" })
    .toArray())[0];

  let emptyObj = await runMutation({
    mutation: `updateType1(_id: "${obj._id}", Updates: { field2: "ZZZ" }) {Type1{autoUpdateField, autoAdjustField}}`,
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
    mutation: `updateType2(_id: "${obj._id}", Updates: { field2: "yyy" }) {Type2{field1, field2}}`,
    result: "updateType2"
  });

  expect(emptyObj).toBe(null);

  obj = (await db
    .collection("type2")
    .find({ _id })
    .toArray())[0];

  expect(obj.field2).toBe("xxx");
});

test("Test query afterUpdate hook 1", async () => {
  let obj = (await db
    .collection("type1")
    .find({ field1: "4 a" })
    .toArray())[0];

  let _id = obj._id;

  await runMutation({
    mutation: `updateType1(_id: "${obj._id}", Updates: { field1: "4 a" }) {Type1{field1}}`,
    result: "updateType1"
  });

  let updateObj = (await db
    .collection("updateInfo")
    .find({ updatedId: _id })
    .toArray())[0];

  expect(updateObj.x).toBe(1);
});

test("Test query afterUpdate hook 2", async () => {
  let obj = (await db
    .collection("type2")
    .find({ field1: "4 a" })
    .toArray())[0];

  let _id = obj._id;

  await runMutation({
    mutation: `updateType2(_id: "${obj._id}", Updates: { field1: "4 a" }) {Type2{field1}}`,
    result: "updateType2"
  });

  let updateObj = (await db
    .collection("updateInfo")
    .find({ updatedId: _id })
    .toArray())[0];

  expect(updateObj.x).toBe(2);
});

test("Test query before delete hook 1", async () => {
  let newO = { field1: "X", userId: 0 };
  await db.collection("type1").insertOne(newO);

  let _id = newO._id;

  await runMutation({
    mutation: `deleteType1(_id: "${_id}"){success}`,
    result: "deleteType1"
  });

  let deleteObj = (await db
    .collection("type1")
    .find({ _id })
    .toArray())[0];

  expect(typeof deleteObj).toBe("object");
});

test("Test query before delete hook 1 A", async () => {
  let newO = { field1: "XYZ", userId: 1, _id: "59334468a71fc3de245e2d6d" };
  await db.collection("type1").insertOne(newO);
  let _id = newO._id;

  let result = await runMutation({
    mutation: `deleteType1(_id: "${_id}"){success}`,
    result: "deleteType1"
  });
  expect(result).toEqual({ success: false });

  let notDeletedObj = (await db
    .collection("type1")
    .find({ _id })
    .toArray())[0];

  expect(typeof notDeletedObj).toBe("object");

  await db.collection("type1").deleteMany({ _id });
});

test("Test query before delete hook 2", async () => {
  let newO = { field1: "XXX", userId: 1 };
  await db.collection("type2").insertOne(newO);

  let _id = newO._id;

  await runMutation({
    mutation: `deleteType2(_id: "${_id}"){success}`,
    result: "deleteType2"
  });

  let deleteObj = (await db
    .collection("type2")
    .find({ _id })
    .toArray())[0];

  expect(typeof deleteObj).toBe("object");
});

test("Test query before delete hook 2 A", async () => {
  let newO = { field1: "XYZ", userId: 1, _id: "591b74d036f369d06bb7781d" };
  await db.collection("type2").insertOne(newO);
  let _id = newO._id;

  let result = await runMutation({
    mutation: `deleteType2(_id: "${_id}"){success}`,
    result: "deleteType2"
  });
  expect(result).toEqual({ success: false });

  let notDeletedObj = (await db
    .collection("type2")
    .find({ _id })
    .toArray())[0];

  expect(typeof notDeletedObj).toBe("object");

  await db.collection("type1").deleteMany({ _id });
});

test("Test query after delete hook 1", async () => {
  let newO = { field1: "___" };
  await db.collection("type1").insertOne(newO);

  let _id = newO._id;

  await runMutation({
    mutation: `deleteType1(_id: "${_id}"){success}`,
    result: "deleteType1"
  });

  let deleteObj = (await db
    .collection("deleteInfo")
    .find({ deletedId: _id })
    .toArray())[0];

  expect(deleteObj.x).toBe(1);
});

test("Test query after delete hook 2", async () => {
  let newO = { field1: "___" };
  await db.collection("type2").insertOne(newO);

  let _id = newO._id;

  await runMutation({
    mutation: `deleteType2(_id: "${_id}"){success}`,
    result: "deleteType2"
  });

  let deleteObj = (await db
    .collection("deleteInfo")
    .find({ deletedId: _id })
    .toArray())[0];

  expect(deleteObj.x).toBe(2);
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

test("Test after insert 1", async () => {
  let obj = await runMutation({
    mutation: `createType1(Type1: { field1: "___" }) {Type1{_id, field1}}`,
    result: "createType1"
  });

  let updateObj = (await db
    .collection("insertInfo")
    .find({ insertedId: obj._id })
    .toArray())[0];

  expect(updateObj.y).toBe(1);

  await db.collection("insertInfo").deleteMany({});
});

test("Test before insert 1 A", async () => {
  let obj = await runMutation({
    mutation: `createType1(Type1: { field1: "KILL" }) {Type1{_id, field1}}`,
    result: "createType1"
  });

  let inserted = (await db
    .collection("type1")
    .find({ field1: "KILL" })
    .toArray())[0];

  expect(obj).toBe(null);
  expect(inserted).toBe(void 0);
});

test("Test before insert 2 A", async () => {
  let obj = await runMutation({
    mutation: `createType2(Type2: { field1: "KILL" }) {Type2{_id, field1}}`,
    result: "createType2"
  });

  let inserted = (await db
    .collection("type2")
    .find({ field1: "KILL" })
    .toArray())[0];

  expect(obj).toBe(null);
  expect(inserted).toBe(void 0);
});

test("Test before insert 2 AA", async () => {
  let obj = await runMutation({
    mutation: `createType2(Type2: { field1: "BAD" }) {Type2{_id, field1}}`,
    result: "createType2"
  });

  let inserted = (await db
    .collection("type2")
    .find({ field1: "KILL" })
    .toArray())[0];

  expect(obj).toBe(null);
  expect(inserted).toBe(void 0);
});

test("Test after insert 2", async () => {
  let obj = await runMutation({
    mutation: `createType2(Type2: { field1: "___" }) {Type2{_id, field1}}`,
    result: "createType2"
  });

  let updateObj = (await db
    .collection("insertInfo")
    .find({ insertedId: obj._id })
    .toArray())[0];

  expect(updateObj.y).toBe(2);

  await db.collection("insertInfo").deleteMany({});
});
