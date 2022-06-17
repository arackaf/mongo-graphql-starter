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

const q__id_arr = {
  field: "q__id_arr",
  queries: [
    {
      args: ["_contains"],
      value: '"6164d3d577f54f44209b7941"'
    },
    {
      args: ["", "_containsAny", "_containsAll", "_ne"],
      value: '["6164d3d577f54f44209b7941"]'
    },
    {
      args: ["_in", "_nin"],
      value: '[["6164d3d577f54f44209b7941"]]'
    }
  ]
};

function processField({ field, queries }) {
  const queryable = field;
  const nonqueryable = `n${field}`;

  queries.forEach(({ args, value }) => {
    args.forEach(arg => {
      test("Testing queryable " + (arg || "match"), async () => {
        queriesWithoutError({
          query: `{allThing1s(${queryable}${arg}: ${value}) { Thing1s { _id } }}`
        });
      });

      test("Testing non-queryable " + (arg || "match"), async () => {
        queryFails({
          query: `{allThing1s(${nonqueryable}${arg}: ${value}) { Thing1s { _id } }}`
        });
      });
    });
  });
}

processField(q__id_arr);
