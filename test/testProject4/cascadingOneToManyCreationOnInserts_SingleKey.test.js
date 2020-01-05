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

test("Add mainAuthorBooks in new author", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {name: "Adam", mainAuthorBooks: [{title: "New Book 1"}] }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name, mainAuthorBooks{title}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", mainAuthorBooks: [{ title: "New Book 1" }] }]
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam" }]
  });

  await queryAndMatchArray({
    query: `{allBooks{Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "New Book 1" }] //just one
  });
});

test("Add mainAuthorBooks entry in new author, and nested objects A", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam", 
      subjects: [{ name: "s1" }, { name: "s2" }] 
      mainSubject: { name: "ms" }, 
      mainAuthorBooks: [{
        title: "New Book 1" 
      }] 
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorBooks{title, mainAuthor {name, mainSubject{name}, subjects(SORT: {name: 1}){name}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorBooks: [
          { title: "New Book 1", mainAuthor: { name: "adam", mainSubject: { name: "ms" }, subjects: [{ name: "s1" }, { name: "s2" }] } }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "New Book 1" }]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }]
  });
});

test("Add mainAuthorBooks entry in new author, and nested objects B", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      mainSubject: { name: "ms" },
      subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }]
      mainAuthorBooks: [{
        title: "New Book 1",
      }]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorBooks{title, mainAuthor {name, mainSubject{name}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorBooks: [
          {
            title: "New Book 1",
            mainAuthor: {
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

test("Add mainAuthorBooks entry in new author, and nested objects C", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
      mainSubject: { name: "ms" },
      mainAuthorBooks: [{
        title: "New Book 1",
      }]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorBooks{title, mainAuthor {name, mainSubject{name}, mainAuthorBooks{title}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorBooks: [
          {
            title: "New Book 1",
            mainAuthor: {
              name: "adam",
              mainSubject: { name: "ms" },
              mainAuthorBooks: [{ title: "New Book 1" }],
              subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
            }
          }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "New Book 1" }]
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

test("Add mainAuthorBooks entry in new author, and nested objects C - with fragments", async () => {
  let result = await runMutation({
    prefix: `
      fragment d1 on Author {
        name
      }
      fragment d2 on Book {
        title
      }
      fragment d3 on Subject {
        name
      }
      fragment d4 on Keyword {
        keywordName
      }
    `,
    mutation: `createAuthor(Author: {
      name: "adam",
      subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
      mainSubject: { name: "ms" },
      mainAuthorBooks: [{
        title: "New Book 1",
      }]
    }){Author{ ...d1, mainAuthorBooks{...d2, mainAuthor {name, mainSubject{...d3}, mainAuthorBooks{...d2}, subjects(SORT: {name: 1}){...d3, keywords(SORT: {keywordName: 1}){...d4}}} } }}`,
    result: "createAuthor"
  });

  expect(result).toEqual({
    name: "adam",
    mainAuthorBooks: [
      {
        title: "New Book 1",
        mainAuthor: {
          name: "adam",
          mainSubject: { name: "ms" },
          mainAuthorBooks: [{ title: "New Book 1" }],
          subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
        }
      }
    ]
  });
});

test("Add mainAuthorBooks entry in new author, and nested objects C - with fragments on update", async () => {
  let author = await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
      mainSubject: { name: "ms" },
      mainAuthorBooks: [{
        title: "New Book 1",
      }]
    }){Author{ _id }}`,
    result: "createAuthor"
  });

  let result = await runMutation({
    prefix: `
      fragment d1 on Author {
        name
      }
      fragment d2 on Book {
        title
      }
      fragment d3 on Subject {
        name
      }
      fragment d4 on Keyword {
        keywordName
      }
    `,
    mutation: `updateAuthor(_id: "${author._id}") {Author{ ...d1, mainAuthorBooks{...d2, mainAuthor {name, mainSubject{...d3}, mainAuthorBooks{...d2}, subjects(SORT: {name: 1}){...d3, keywords(SORT: {keywordName: 1}){...d4}}} } }}`,
    result: "updateAuthor"
  });

  expect(result).toEqual({
    name: "adam",
    mainAuthorBooks: [
      {
        title: "New Book 1",
        mainAuthor: {
          name: "adam",
          mainSubject: { name: "ms" },
          mainAuthorBooks: [{ title: "New Book 1" }],
          subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
        }
      }
    ]
  });
});

test("Add mainAuthorBooks entry in new author, and nested objects D", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      mainSubject: { name: "ms" },
      subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
      mainAuthorBooks: [{
        title: "New Book 1",
        authors: [{name: "a1", mainAuthorBooks: [{title: "Nested Book A1"}]}]
      }]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorBooks{title, authors(SORT: {name: 1}){name, mainAuthorBooks(SORT: {title: 1}){title}}, mainAuthor {name, mainSubject{name}, mainAuthorBooks{title}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorBooks: [
          {
            title: "New Book 1",
            authors: [{ name: "a1", mainAuthorBooks: [{ title: "Nested Book A1" }] }],
            mainAuthor: {
              name: "adam",
              mainSubject: { name: "ms" },
              mainAuthorBooks: [{ title: "New Book 1" }],
              subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
            }
          }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Nested Book A1" }, { title: "New Book 1" }]
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

test("Add mainAuthorBooks entry in new author, and nested objects E", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      mainSubject: { name: "ms" },
      subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
      mainAuthorBooks: [{
        title: "New Book 1",
        authors: [{name: "a1", mainAuthorBooks: [{title: "Nested Book A1"}], books: [{title: "Nested Book A2"}] }]
      }]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, mainAuthorBooks{title, authors(SORT: {name: 1}){name, mainAuthorBooks(SORT: {title: 1}){title}, books(SORT: {title: 1}){title} }, mainAuthor {name, mainSubject{name}, mainAuthorBooks{title}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        mainAuthorBooks: [
          {
            title: "New Book 1",
            authors: [{ name: "a1", mainAuthorBooks: [{ title: "Nested Book A1" }], books: [{ title: "Nested Book A2" }, { title: "New Book 1" }] }],
            mainAuthor: {
              name: "adam",
              mainSubject: { name: "ms" },
              mainAuthorBooks: [{ title: "New Book 1" }],
              subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
            }
          }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title}}}`,
    coll: "allBooks",
    results: [{ title: "Nested Book A1" }, { title: "Nested Book A2" }, { title: "New Book 1" }]
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
