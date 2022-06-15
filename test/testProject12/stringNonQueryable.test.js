import spinUp from "./spinUp";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").insertOne({ title: "Book 1", isRead: true });
  await db.collection("books").insertOne({ title: "Book 2", isRead: false });
  await db.collection("books").insertOne({ title: "Book 3", isRead: true });
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  close();
  db = null;
});

test("temp", async () => {
  expect(1).toBe(1);
});
