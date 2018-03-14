import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  let adam = { name: "Adam", birthday: new Date("2000-01-01") };
  let katie = { name: "Katie", birthday: new Date("2000-01-02") };
  let laura = { name: "Laura", birthday: new Date("2000-01-03") };
  let mallory = { name: "Mallory", birthday: new Date("2001-01-01") };
  let eddie = { name: "Eddie", birthday: new Date("2001-01-01") };
  let mirelle = { name: "Mirelle", birthday: new Date("2001-01-01") };
  let murphy = { name: "Murphy", birthday: new Date("2002-09-01") };
  let mark = { name: "Mark", birthday: new Date("2010-11-01") };
  let andre = { name: "Andre", birthday: new Date("2013-01-31") };
  let michael = { name: "Michael", birthday: new Date("2016-01-01") };

  await Promise.all(
    [adam, katie, laura, mallory, eddie, mirelle, murphy, mark, andre, michael].map(person => db.collection("authors").insert(person))
  );

  let book1 = { title: "Book 1", pages: 100, authorIds: [adam, katie, eddie, mirelle, andre, michael].map(p => "" + p._id) };
  let book2 = { title: "Book 2", pages: 150, authorIds: [adam, andre, michael].map(p => "" + p._id) };
  let book3 = { title: "Book 3", pages: 200, authorIds: ["" + katie._id] };

  await db.collection("books").insert(book1);
  await db.collection("books").insert(book2);
  await db.collection("books").insert(book3);
});

afterAll(async () => {
  await db.collection("books").remove({});
  await db.collection("authors").remove({});
  db.close();
  db = null;
});

test("Read authors sorted name asc", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_contains: "1"){Books{title, authors(SORT: {name: 1}){name}}}}`,
    coll: "allBooks",
    results: [
      {
        title: "Book 1",
        authors: [{ name: "Adam" }, { name: "Andre" }, { name: "Eddie" }, { name: "Katie" }, { name: "Michael" }, { name: "Mirelle" }]
      }
    ]
  });
});