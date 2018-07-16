import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insert({ title: "Book 1", isRead: true });
  await db.collection("books").insert({ title: "Book 2", isRead: false });
  await db.collection("books").insert({ title: "Book 3", isRead: true });
});

afterAll(async () => {
  await db.collection("books").remove({});
  close();
  db = null;
});

test("Using mongodb 3", async () => {
  expect(typeof db.close).toBe("undefined");
});
