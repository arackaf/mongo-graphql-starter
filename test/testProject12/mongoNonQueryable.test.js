import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close, queriesWithoutError, queryFails;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close, queriesWithoutError, queryFails } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1", isRead: true });
  await db.collection("books").insertOne({ title: "Book 2", isRead: false });
  await db.collection("books").insertOne({ title: "Book 3", isRead: true });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

const mongoArgs = ["", "_ne"];
const mongoArrArgs = ["_in", "_nin"];

const queryable = "q__id";
const nonqueryable = "nq__id";

mongoArgs.forEach(arg => {
  test("Testing queryable " + (arg || "match"), async () => {
    queriesWithoutError({
      query: `{allThing1s(${queryable}${arg}: "6164d3d577f54f44209b7941") { Thing1s { _id } }}`
    });
  });

  test("Testing non-queryable " + (arg || "match"), async () => {
    queryFails({
      query: `{allThing1s(${nonqueryable}${arg}: "6164d3d577f54f44209b7941") { Thing1s { _id } }}`
    });
  });
});

mongoArrArgs.forEach(arg => {
  test("Testing queryable " + (arg || "match"), async () => {
    queriesWithoutError({
      query: `{allThing1s(${queryable}${arg}: ["6164d3d577f54f44209b7941"]) { Thing1s { _id } }}`
    });
  });

  test("Testing non-queryable " + (arg || "match"), async () => {
    queryFails({
      query: `{allThing1s(${nonqueryable}${arg}: ["6164d3d577f54f44209b7941"]) { Thing1s { _id } }}`
    });
  });
});
