import { mongoQueryHelpers } from "../index";
const { getMongoProjection } = mongoQueryHelpers;

//import

test("Mongo projection correctly created", () => {
  expect(getMongoProjection(["_id", "title", "publisher"])).toEqual({ _id: 1, title: 1, publisher: 1 });
});
