import { queryUtilities } from "../../src/module";
const { getMongoFilters } = queryUtilities;

import { create } from "../testProject1/spinUp";

let Book;

beforeAll(async () => {
  await create();
  Book = (await import("../testProject1/graphQL/Book/Book")).default;
});

//---------------------------------------- STRING ---------------------------------------------------

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

//---------------------------------------- INT ---------------------------------------------------

test("Mongo int equals filter", () => {
  expect(getMongoFilters({ pages: 12 }, Book)).toEqual({ pages: 12 });
});

test("Mongo int lt contains filter", () => {
  expect(getMongoFilters({ pages_lt: 12 }, Book)).toEqual({ pages: { $lt: 12 } });
});

test("Mongo int lte startsWith filter", () => {
  expect(getMongoFilters({ pages_lte: 12 }, Book)).toEqual({ pages: { $lte: 12 } });
});

test("Mongo int gt endsWith filter", () => {
  expect(getMongoFilters({ pages_gt: 12 }, Book)).toEqual({ pages: { $gt: 12 } });
});

test("Mongo int gte endsWith filter", () => {
  expect(getMongoFilters({ pages_gte: 12 }, Book)).toEqual({ pages: { $gte: 12 } });
});

//---------------------------------------- FLOAT ---------------------------------------------------

test("Mongo float equals filter", () => {
  expect(getMongoFilters({ weight: 12.5 }, Book)).toEqual({ weight: 12.5 });
});

test("Mongo float lt contains filter", () => {
  expect(getMongoFilters({ weight_lt: 12.5 }, Book)).toEqual({ weight: { $lt: 12.5 } });
});

test("Mongo float lte startsWith filter", () => {
  expect(getMongoFilters({ weight_lte: 12.5 }, Book)).toEqual({ weight: { $lte: 12.5 } });
});

test("Mongo float gt endsWith filter", () => {
  expect(getMongoFilters({ weight_gt: 12.5 }, Book)).toEqual({ weight: { $gt: 12.5 } });
});

test("Mongo float gte endsWith filter", () => {
  expect(getMongoFilters({ weight_gte: 12.5 }, Book)).toEqual({ weight: { $gte: 12.5 } });
});

//---------------------------------------- OR ---------------------------------------------------

test("Mongo OR filters 1", () => {
  expect(getMongoFilters({ OR: [{ weight: 12.5 }, { weight_lte: 13 }, { weight_gt: 15 }] }, Book)).toEqual({
    $or: [{ weight: 12.5 }, { weight: { $lte: 13 } }, { weight: { $gt: 15 } }]
  });
});

test("Mongo OR filters 2", () => {
  expect(getMongoFilters({ weight: 11, OR: [{ weight: 12.5 }, { weight_lte: 13 }, { weight_gt: 15 }] }, Book)).toEqual({
    weight: 11,
    $or: [{ weight: 12.5 }, { weight: { $lte: 13 } }, { weight: { $gt: 15 } }]
  });
});

test("Mongo OR filters 3", () => {
  expect(getMongoFilters({ OR: [{ weight: 12.5 }, { OR: [{ weight_gte: 15 }, { weight_lte: 13 }] }, { weight_gt: 15 }] }, Book)).toEqual({
    $or: [{ weight: 12.5 }, { $or: [{ weight: { $gte: 15 } }, { weight: { $lte: 13 } }] }, { weight: { $gt: 15 } }]
  });
});

test("Mongo OR filters 4", () => {
  expect(getMongoFilters({ weight: 11, OR: [{ weight: 12.5 }, { OR: [{ weight_gte: 15 }, { weight_lte: 13 }] }, { weight_gt: 15 }] }, Book)).toEqual({
    weight: 11,
    $or: [{ weight: 12.5 }, { $or: [{ weight: { $gte: 15 } }, { weight: { $lte: 13 } }] }, { weight: { $gt: 15 } }]
  });
});

test("Mongo OR filters 5", () => {
  expect(
    getMongoFilters({ OR: [{ weight: 12.5 }, { OR: [{ weight_gte: 15, pages_gte: 20 }, { weight_lte: 13 }] }, { weight_gt: 15 }] }, Book)
  ).toEqual({
    $or: [{ weight: 12.5 }, { $or: [{ weight: { $gte: 15 }, pages: { $gte: 20 } }, { weight: { $lte: 13 } }] }, { weight: { $gt: 15 } }]
  });
});

test("Mongo OR filters 6", () => {
  expect(
    getMongoFilters({ weight: 11, OR: [{ weight: 12.5 }, { OR: [{ weight_gte: 15, pages_gte: 20 }, { weight_lte: 13 }] }, { weight_gt: 15 }] }, Book)
  ).toEqual({
    weight: 11,
    $or: [{ weight: 12.5 }, { $or: [{ weight: { $gte: 15 }, pages: { $gte: 20 } }, { weight: { $lte: 13 } }] }, { weight: { $gt: 15 } }]
  });
});
