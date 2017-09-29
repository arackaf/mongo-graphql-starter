import { mongoQueryHelpers } from "../index";
const { getMongoProjection, getMongoFilters } = mongoQueryHelpers;

import Book from "./testProject1/project/graphQL/Book/Book";

//import

test("Mongo projection correctly created", () => {
  expect(getMongoProjection(["_id", "title", "publisher"])).toEqual({ _id: 1, title: 1, publisher: 1 });
});

test("Every Mongo string filter", () => {
  expect(getMongoFilters({ title: "a" }, Book)).toEqual({ title: "a" });
});

/*

    title: String,
    title_contains: String,
    title_startsWith: String,
    title_endsWith: String,

*/
