import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, runQuery, queryAndMatchArray, runMutation, close;
let adam, katie, laura, mallory, book1, book2, book3;

beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runQuery, runMutation, close } = await spinUp());
});

afterEach(async () => {
  await db.collection("books").deleteMany({});
  await db.collection("authors").deleteMany({});
  await db.collection("subjects").deleteMany({});
  await db.collection("keywords").deleteMany({});
});

afterAll(async () => {
  close();
  db = null;
});

test("Add books entry in new author, and nested objects A", async () => {
  let a = await runMutation({
    mutation: `createAuthor(Author: { name: "adam" }){Author{_id, name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateAuthor(_id: "${a._id}", Updates: {}, mainAuthorBooks_ADD: [
      {
        title: "New Book 1",
        authors: [{
          name: "ma",
          mainSubject: { name: "ms" },
          subjects: [{ name: "s1" }, { name: "s2" }]
        }]
      }
    ]){Author{name}}`,
    result: "updateAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorBooks{title, authors {name, mainSubject{name}, subjects(SORT: {name: 1}){name}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorBooks: [{ title: "New Book 1", authors: [{ name: "ma", mainSubject: { name: "ms" }, subjects: [{ name: "s1" }, { name: "s2" }] }] }]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }] //just one
  });
});

test("Add books entry in new author, and nested objects B", async () => {
  let a = await runMutation({
    mutation: `createAuthor(Author: { name: "adam" }){Author{_id, name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateAuthor(_id: "${a._id}", Updates: {}, mainAuthorBooks_ADD: [
        {
          title: "New Book 1",
          authors: [{
            name: "ma",
            mainSubject: { name: "ms" },
            subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }]
          }]
        }
      ]){Author{name}}`,
    result: "updateAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorBooks{title, authors {name, mainSubject{name}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorBooks: [
          {
            title: "New Book 1",
            authors: [
              {
                name: "ma",
                mainSubject: { name: "ms" },
                subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
              }
            ]
          }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }]
  });

  await queryAndMatchArray({
    query: `{allKeywords(SORT: {keywordName: 1}){Keywords{keywordName}}}`,
    coll: "allKeywords",
    results: [{ keywordName: "k1" }, { keywordName: "k2" }]
  });
});

test("Add books entry in new author, and nested objects C", async () => {
  let a = await runMutation({
    mutation: `createAuthor(Author: { name: "adam" }){Author{_id, name}}`,
    result: "createAuthor"
  });

  await runMutation({
    mutation: `updateAuthor(_id: "${a._id}", Updates: {}, mainAuthorBooks_ADD: [
      {
        title: "New Book 1",
        authors: [{
          name: "ma",
          mainSubject: { name: "ms" },
          subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
          books: [{title: "Nested Book 1"}]
        }]
      }
    ]){Author{name}}`,
    result: "updateAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorBooks{title, authors {name, mainSubject{name}, books{title}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorBooks: [
          {
            title: "New Book 1",
            authors: [
              {
                name: "ma",
                mainSubject: { name: "ms" },
                books: [{ title: "Nested Book 1" }, { title: "New Book 1" }],
                subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
              }
            ]
          }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Nested Book 1" }, { title: "New Book 1" }]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }]
  });

  await queryAndMatchArray({
    query: `{allKeywords(SORT: {keywordName: 1}){Keywords{keywordName}}}`,
    coll: "allKeywords",
    results: [{ keywordName: "k1" }, { keywordName: "k2" }]
  });
});
