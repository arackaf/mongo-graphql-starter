import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation, close;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation, close } = await spinUp());

  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});

  let adam = { name: "Adam", birthday: new Date("1982-03-22") };
  let katie = { name: "Katie", birthday: new Date("2009-08-05") };
  let laura = { name: "Laura", birthday: new Date("1974-12-19") };
  let mallory = { name: "Mallory", birthday: new Date("1956-08-02") };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insertOne(person)));

  let book1 = { title: "Book 1", pages: 100, mainAuthorId_readonly: adam._id };
  let book2 = { title: "Book 2", pages: 150, mainAuthorId_readonly: katie._id };
  let book3 = { title: "Book 3", pages: 200, mainAuthorId_readonly: katie._id };

  await db.collection("books").insertOne(book1);
  await db.collection("books").insertOne(book2);
  await db.collection("books").insertOne(book3);
});

afterAll(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  close();
  db = null;
});

test("Read author's readonly books", async () => {
  await queryAndMatchArray({
    query: `{allAuthors(name_startsWith: "Adam"){Authors{name, mainAuthorBooks_readonly(SORT: {title: 1}){title}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", mainAuthorBooks_readonly: [{ title: "Book 1" }] }]
  });
});

test("Can't insert in readonly collections", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {name: "Adam", mainAuthorBooks_readonly: [{title: "Won't Save"}]}){Author{name}}`,
    expectedError: /mainAuthorBooks_readonly.*is not defined/
  });
});

test("Can't insert in readonly object", async () => {
  await runMutation({
    mutation: `createBook(Book: {title: "Book 1", mainAuthor_readonly: {name: "Won't Save"}}){Book{title}}`,
    expectedError: /mainAuthor_readonly.*is not defined/
  });
});

test("Read author's books and back", async () => {
  await queryAndMatchArray({
    query: `{
      allAuthors(name_startsWith: "Adam"){
        Authors{
          name, 
          mainAuthorBooks_readonly(SORT: {title: 1}){
            title, 
            mainAuthor_readonly{
              name
            }
          }
        }
      }
    }`,
    coll: "allAuthors",
    results: [
      {
        name: "Adam",
        mainAuthorBooks_readonly: [{ title: "Book 1", mainAuthor_readonly: { name: "Adam" } }]
      }
    ]
  });
});

test("Read author's books and back and back again", async () => {
  await queryAndMatchArray({
    query: `{
      allAuthors(name_startsWith: "Adam"){
        Authors{
          name, 
          mainAuthorBooks_readonly(SORT: {title: 1}){
            title, 
            mainAuthor_readonly{
              name,
              mainAuthorBooks_readonly(SORT: {title: 1}){
                title
              }
            }
          }
        }
      }
    }`,
    coll: "allAuthors",
    results: [
      {
        name: "Adam",
        mainAuthorBooks_readonly: [{ title: "Book 1", mainAuthor_readonly: { name: "Adam", mainAuthorBooks_readonly: [{ title: "Book 1" }] } }]
      }
    ]
  });
});
