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

test("Add mainAuthorNamesBooks in new author", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {name: "Adam", mainAuthorNamesBooks: [{title: "New Book 1"}] }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name, mainAuthorNamesBooks{title}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", mainAuthorNamesBooks: [{ title: "New Book 1" }] }]
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam" }]
  });

  await queryAndMatchArray({
    query: `{allBooks{Books{title mainAuthorName}}}`,
    coll: "allBooks",
    results: [{ title: "New Book 1", mainAuthorName: "Adam" }] //just one
  });
});

test("Add mainAuthorNamesBooks entry in new author, and nested objects A", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      subjects: [{ name: "s1" }, { name: "s2" }]
      mainSubject: { name: "ms" },
      mainAuthorNamesBooks: [{
        title: "New Book 1"
      }]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorNamesBooks{title, mainAuthorByName {name, mainSubject{name}, subjects(SORT: {name: 1}){name}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorNamesBooks: [
          { title: "New Book 1", mainAuthorByName: { name: "adam", mainSubject: { name: "ms" }, subjects: [{ name: "s1" }, { name: "s2" }] } }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title mainAuthorName}}}`,
    coll: "allBooks",
    results: [{ title: "New Book 1", mainAuthorName: "adam" }]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }]
  });
});

test("Add mainAuthorNamesBooks entry in new author, and nested objects B", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      mainSubject: { name: "ms" },
      subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }]
      mainAuthorNamesBooks: [{
        title: "New Book 1",
      }]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorNamesBooks{title, mainAuthorName, mainAuthorByName {name, mainSubject{name}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorNamesBooks: [
          {
            title: "New Book 1",
            mainAuthorName: "adam",
            mainAuthorByName: {
              name: "adam",
              mainSubject: { name: "ms" },
              subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
            }
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

test("Add mainAuthorNamesBooks entry in new author, and nested objects C", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
      mainSubject: { name: "ms" },
      mainAuthorNamesBooks: [{
        title: "New Book 1",
      }]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorNamesBooks{title, mainAuthorByName {name, mainSubject{name}, mainAuthorNamesBooks{title}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorNamesBooks: [
          {
            title: "New Book 1",
            mainAuthorByName: {
              name: "adam",
              mainSubject: { name: "ms" },
              mainAuthorNamesBooks: [{ title: "New Book 1" }],
              subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
            }
          }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title mainAuthorName}}}`,
    coll: "allBooks",
    results: [{ title: "New Book 1", mainAuthorName: "adam" }]
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

test("Add mainAuthorNamesBooks entry in new author, and nested objects D", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      mainSubject: { name: "ms" },
      subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
      mainAuthorNamesBooks: [{
        title: "New Book 1",
        authors: [{name: "a1", mainAuthorNamesBooks: [{title: "Nested Book A1"}]}]
      }]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorNamesBooks{title, authors(SORT: {name: 1}){name, mainAuthorNamesBooks(SORT: {title: 1}){title}}, mainAuthorByName {name, mainSubject{name}, mainAuthorNamesBooks{title}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorNamesBooks: [
          {
            title: "New Book 1",
            authors: [{ name: "a1", mainAuthorNamesBooks: [{ title: "Nested Book A1" }] }],
            mainAuthorByName: {
              name: "adam",
              mainSubject: { name: "ms" },
              mainAuthorNamesBooks: [{ title: "New Book 1" }],
              subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
            }
          }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title mainAuthorName}}}`,
    coll: "allBooks",
    results: [{ title: "Nested Book A1", mainAuthorName: "a1" }, { title: "New Book 1", mainAuthorName: "adam" }]
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

  await queryAndMatchArray({
    query: `{allAuthors(SORT: {name: 1}){Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "a1" }, { name: "adam" }]
  });
});

test("Add mainAuthorNamesBooks entry in new author, and nested objects E", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      mainSubject: { name: "ms" },
      subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
      mainAuthorNamesBooks: [{
        title: "New Book 1",
        authors: [{name: "a1", mainAuthorNamesBooks: [{title: "Nested Book A1"}], books: [{title: "Nested Book A2"}] }]
      }]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorNamesBooks{title, authors(SORT: {name: 1}){name, mainAuthorNamesBooks(SORT: {title: 1}){title}, books(SORT: {title: 1}){title} }, mainAuthorByName {name, mainSubject{name}, mainAuthorNamesBooks{title}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorNamesBooks: [
          {
            title: "New Book 1",
            authors: [
              { name: "a1", mainAuthorNamesBooks: [{ title: "Nested Book A1" }], books: [{ title: "Nested Book A2" }, { title: "New Book 1" }] }
            ],
            mainAuthorByName: {
              name: "adam",
              mainSubject: { name: "ms" },
              mainAuthorNamesBooks: [{ title: "New Book 1" }],
              subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
            }
          }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title mainAuthorName}}}`,
    coll: "allBooks",
    results: [
      { title: "Nested Book A1", mainAuthorName: "a1" },
      { title: "Nested Book A2", mainAuthorName: null },
      { title: "New Book 1", mainAuthorName: "adam" }
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

  await queryAndMatchArray({
    query: `{allAuthors(SORT: {name: 1}){Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "a1" }, { name: "adam" }]
  });
});
