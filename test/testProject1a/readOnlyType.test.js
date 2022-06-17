import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeEach(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("tagsReadonly").insertOne({ name: "Tag 1" });
  await db.collection("tagsReadonly").insertOne({ name: "Tag 2" });
  await db.collection("tagsReadonly").insertOne({ name: "Tag 3" });
});

afterEach(async () => {
  await db.collection("tagsReadonly").deleteMany({});
  close();
  db = null;
});

test("Read single works", async () => {
  let tags = await db
    .collection("tagsReadonly")
    .find({}, { name: 1 })
    .toArray();

  await queryAndMatchArray({
    query: `{getReadonlyTag(_id: "${tags[0]._id}"){ReadonlyTag{name}}}`,
    coll: "getReadonlyTag",
    results: { name: tags[0].name }
  });
});

test("Read multi works", async () => {
  await queryAndMatchArray({
    query: `{allReadonlyTags(name: "Tag 1"){ReadonlyTags{name}}}`,
    coll: "allReadonlyTags",
    results: [{ name: "Tag 1" }]
  });
});

test("Single update", async () => {
  let tags = await db
    .collection("tagsReadonly")
    .find({}, { _id: 1 })
    .toArray();

  await runMutation({
    mutation: `updateReadonlyTag(_id: "${tags[0]._id}", Updates: {name: "X"}){ReadonlyTag{name}}`,
    expectedError: /cannot query field.+updateReadonlyTag/i
  });
});

test("Multi update", async () => {
  let tags = await db
    .collection("tagsReadonly")
    .find({}, { _id: 1 })
    .toArray();

  await runMutation({
    mutation: `updateReadonlyTags(_ids: [${tags.map(t => '"' + t._id + '"').join(",")}], Updates: {name: "X"}){ReadonlyTags{name}}`,
    expectedError: /cannot query field.+updateReadonlyTags/i
  });
});

test("Bulk update", async () => {
  let tags = await db
    .collection("tagsReadonly")
    .find({}, { _id: 1 })
    .toArray();

  await runMutation({
    mutation: `updateReadonlyTagsBulk(Match: { name: "" }, Updates: {name: "X"}){success}`,
    expectedError: /cannot query field.+updateReadonlyTagsBulk/i
  });
});

test("Create", async () => {
  await runMutation({
    mutation: `createReadonlyTag(ReadonlyTag: { name: "X" }){ReadonlyTag{name}}`,
    expectedError: /cannot query field.+createReadonlyTag/i
  });
});

test("Delete", async () => {
  let tags = await db
    .collection("tagsReadonly")
    .find({}, { _id: 1 })
    .toArray();

  await runMutation({
    mutation: `deleteReadonlyTag(_id: "${tags[0]._id}")`,
    expectedError: /cannot query field.+deleteReadonlyTag/i
  });
});
