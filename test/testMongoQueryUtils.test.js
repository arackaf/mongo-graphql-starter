import { mongoQueryHelpers } from "../index";
const { getMongoProjection, getMongoFilters } = mongoQueryHelpers;

import Book from "./testProject1/project/graphQL/Book/Book";

//import

test("Mongo projection correctly created", () => {
  expect(getMongoProjection(["_id", "title", "publisher"])).toEqual({ _id: 1, title: 1, publisher: 1 });
});

test("Mongo string equals filter", () => {
  expect(getMongoFilters({ title: "a" }, Book)).toEqual({ title: "a" });
});

test("Mongo string contains filter", () => {
  expect(getMongoFilters({ title_contains: "a" }, Book)).toEqual({ title: { $regex: new RegExp("a", "i") } });
});

test("Mongo string startsWith filter", () => {
  expect(getMongoFilters({ title_startsWith: "a" }, Book)).toEqual({ title: { $regex: new RegExp("^a", "i") } });
});

test("Mongo string endsWith filter", () => {
  expect(getMongoFilters({ title_endsWith: "a" }, Book)).toEqual({ title: { $regex: new RegExp("a$", "i") } });
});

/*

    title: String,
    title_contains: String,
    title_startsWith: String,
    title_endsWith: String,

*/
