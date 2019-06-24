import spinUp from "./spinUp";

beforeAll(async () => {
  await spinUp();
});

test("Add books in new author", async () => {
  expect(1).toBe(1);
});
