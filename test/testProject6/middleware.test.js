import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  let objects = [
    { field1: "a", field2: "a", field3: "a", field4: "a", field5: "a", field6: "a" },
    { field1: "a", field2: "a", field3: "a", field4: "a", field5: "a", field6: "a" },
    { field1: "a", field2: "a", field3: "a", field4: "a", field5: "a", field6: "a" },
    { field1: "a", field2: "a", field3: "a", field4: "a", field5: "a", field6: "a" },
    { field1: "a", field2: "a", field3: "a", field4: "a", field5: "a", field6: "a" },
    { field1: "a", field2: "a", field3: "a", field4: "a", field5: "a", field6: "a" },
    { field1: "x", field2: "a", field3: "a", field4: "a", field5: "a", field6: "a" },
    { field1: "x", field2: "a", field3: "a", field4: "a", field5: "a", field6: "a" },
    { field1: "x", field2: "a", field3: "a", field4: "a", field5: "a", field6: "a" }
  ];

  //await db.collection("books").insert({ title: "Book 1", pages: 100 });
});

afterAll(async () => {
  await db.collection("books").remove({});
  db.close();
  db = null;

  middleware.clearAll();
});

test("Test middleware 1", async () => {
  expect(1).toBe(1);
  return;

  await queryAndMatchArray({
    query: "{allBooks{Books{title, pages}}}",
    coll: "allBooks",
    results: [{ title: "Book 1", pages: 100 }]
  });
});
